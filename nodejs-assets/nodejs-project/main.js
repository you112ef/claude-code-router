const rn_bridge = require('rn-bridge');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// استيراد الوحدات المحولة
const { createServer } = require('./server');
const { formatRequest } = require('./middlewares/formatRequest');
const { rewriteBody } = require('./middlewares/rewriteBody');
const { router } = require('./middlewares/router');
const { log } = require('./utils/log');
const { streamOpenAIResponse } = require('./utils/stream');
const { localAIProvider } = require('./utils/localai');

// متغيرات عامة
let server = null;
let isServiceRunning = false;
let config = {
  log: true,
  OPENAI_API_KEY: '',
  OPENAI_BASE_URL: '',
  OPENAI_MODEL: '',
  Providers: [],
  Router: {
    background: '',
    think: '',
    longContext: ''
  }
};

// خريطة مقدمي الخدمة
const Providers = new Map();
const providerCache = new Map();

// دالة تهيئة الإعدادات
async function initConfig() {
  try {
    // قراءة الإعدادات من التخزين المحلي إذا كانت متوفرة
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      config = { ...config, ...JSON.parse(configData) };
    }
    
    log('تم تحميل الإعدادات:', config);
  } catch (error) {
    log('خطأ في تحميل الإعدادات:', error.message);
  }
}

// دالة حفظ الإعدادات
async function saveConfig() {
  try {
    const configPath = path.join(__dirname, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    log('تم حفظ الإعدادات بنجاح');
  } catch (error) {
    log('خطأ في حفظ الإعدادات:', error.message);
  }
}

// دالة تهيئة مقدمي الخدمة
function initProviders() {
  Providers.clear();
  
  if (Array.isArray(config.Providers)) {
    config.Providers.forEach((provider) => {
      try {
        Providers.set(provider.name, provider);
        log(`تم تحميل مقدم الخدمة: ${provider.name}`);
      } catch (error) {
        log('فشل في تحليل مقدم الخدمة:', error.message);
      }
    });
  }

  // إضافة المقدم الافتراضي
  if (config.OPENAI_API_KEY && config.OPENAI_BASE_URL && config.OPENAI_MODEL) {
    const defaultProvider = {
      name: 'default',
      api_base_url: config.OPENAI_BASE_URL,
      api_key: config.OPENAI_API_KEY,
      models: [config.OPENAI_MODEL],
    };
    Providers.set('default', defaultProvider);
  } else if (Providers.size > 0) {
    const defaultProvider = Providers.values().next().value;
    Providers.set('default', defaultProvider);
  }
}

// دالة بدء الخادم
async function startServer(port = 3456) {
  try {
    if (isServiceRunning) {
      log('الخادم يعمل بالفعل');
      return;
    }

    await initConfig();
    initProviders();
    
    // تهيئة النموذج المحلي
    await localAIProvider.initialize();

    server = await createServer(port);
    
    // إضافة الوسطاء
    server.useMiddleware((req, res, next) => {
      req.config = config;
      next();
    });
    
    server.useMiddleware(rewriteBody);
    
    if (config.Router?.background && config.Router?.think && config.Router?.longContext) {
      server.useMiddleware(router);
    } else {
      server.useMiddleware((req, res, next) => {
        req.provider = 'default';
        req.body.model = config.OPENAI_MODEL;
        next();
      });
    }
    
    server.useMiddleware(formatRequest);

    // نقطة النهاية الرئيسية
    server.app.post('/v1/messages', async (req, res) => {
      try {
        // التحقق من استخدام النموذج المحلي
        if (req.provider === 'local' || req.body.model === 'local-ai') {
          if (localAIProvider.isModelLoaded()) {
            const completion = await localAIProvider.createCompletion(req.body.messages, req.body);
            
            if (req.body.stream) {
              // streaming response
              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache');
              res.setHeader('Connection', 'keep-alive');
              
              const stream = localAIProvider.createStreamCompletion(req.body.messages, req.body);
              for await (const chunk of stream) {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
              }
              res.write('data: [DONE]\n\n');
              res.end();
            } else {
              res.json(completion);
            }
          } else {
            res.status(503).json({ 
              error: 'Local AI model not loaded',
              message: 'يرجى تحميل نموذج ذكاء اصطناعي محلي أولاً'
            });
          }
        } else {
          // استخدام مقدم خدمة خارجي
          const provider = getProviderInstance(req.provider || 'default');
          const completion = await provider.chat.completions.create(req.body);
          await streamOpenAIResponse(res, completion, req.body.model, req.body);
        }
      } catch (e) {
        log('خطأ في استدعاء API:', e.message);
        res.status(500).json({ error: e.message });
      }
    });

    server.start();
    isServiceRunning = true;
    
    log(`🚀 Claude Code Router يعمل على المنفذ ${port}`);
    
    // إرسال حالة الخدمة
    rn_bridge.channel.send({
      type: 'status',
      data: {
        isRunning: true,
        port: port
      }
    });
    
  } catch (error) {
    log('فشل في بدء الخادم:', error.message);
    rn_bridge.channel.send({
      type: 'error',
      error: error.message
    });
  }
}

// دالة إيقاف الخادم
function stopServer() {
  try {
    if (server && isServiceRunning) {
      server.close();
      server = null;
      isServiceRunning = false;
      
      log('تم إيقاف الخادم');
      
      rn_bridge.channel.send({
        type: 'status',
        data: {
          isRunning: false,
          port: 0
        }
      });
    }
  } catch (error) {
    log('فشل في إيقاف الخادم:', error.message);
  }
}

// دالة الحصول على مثيل مقدم الخدمة
function getProviderInstance(providerName) {
  const provider = Providers.get(providerName);
  if (!provider) {
    throw new Error(`مقدم الخدمة ${providerName} غير موجود`);
  }
  
  let openai = providerCache.get(provider.name);
  if (!openai) {
    // إنشاء مثيل جديد من OpenAI
    const OpenAI = require('openai');
    openai = new OpenAI({
      baseURL: provider.api_base_url,
      apiKey: provider.api_key,
    });
    providerCache.set(provider.name, openai);
  }
  return openai;
}

// الاستماع للرسائل من React Native
rn_bridge.channel.on('message', (msg) => {
  log('تم استلام رسالة:', msg);
  
  switch (msg.type) {
    case 'start':
      startServer(msg.port || 3456);
      break;
      
    case 'stop':
      stopServer();
      break;
      
    case 'updateConfig':
      config = { ...config, ...msg.config };
      saveConfig();
      initProviders();
      
      rn_bridge.channel.send({
        type: 'configUpdated',
        data: { success: true }
      });
      break;
      
    case 'getStatus':
      rn_bridge.channel.send({
        type: 'status',
        data: {
          isRunning: isServiceRunning,
          port: isServiceRunning ? 3456 : 0,
          localAI: {
            available: localAIProvider.isModelLoaded(),
            model: localAIProvider.getModelInfo()
          }
        }
      });
      break;
      
    case 'localai_generate':
      // إعادة توجيه طلب النموذج المحلي إلى React Native
      rn_bridge.channel.send({
        type: 'localai_request',
        requestId: msg.requestId,
        prompt: msg.prompt,
        options: msg.options
      });
      break;
      
    case 'localai_model_loaded':
      localAIProvider.setCurrentModel(msg.modelInfo);
      break;
      
    case 'localai_model_unloaded':
      localAIProvider.setCurrentModel(null);
      break;
      
    default:
      log('نوع رسالة غير معروف:', msg.type);
  }
});

// بدء الخدمة تلقائياً
log('بدء تطبيق Claude Code Router...');
rn_bridge.channel.send({
  type: 'ready',
  data: { message: 'Node.js backend ready' }
});