const { log } = require('../utils/log');

// دالة حساب عدد الرموز (تقديرية)
function estimateTokens(text) {
  if (!text) return 0;
  // تقدير تقريبي: كل 4 أحرف = رمز واحد
  return Math.ceil(text.length / 4);
}

function getUseModel(req, tokenCount) {
  // التحقق من وجود موديل محدد في الطلب
  if (req.body.model && req.body.model.includes(',')) {
    const [provider, model] = req.body.model.split(',');
    if (provider && model) {
      return { provider, model };
    }
  }

  // إذا كان عدد الرموز أكثر من 32K، استخدم موديل السياق الطويل
  if (tokenCount > 32000) {
    log('استخدام موديل السياق الطويل بسبب عدد الرموز:', tokenCount);
    const [provider, model] = req.config.Router.longContext.split(',');
    return { provider, model };
  }

  // إذا كان الموديل claude-3-5-haiku، استخدم موديل الخلفية
  if (req.body.model?.startsWith('claude-3-5-haiku')) {
    log('استخدام موديل الخلفية لـ', req.body.model);
    const [provider, model] = req.config.Router.background.split(',');
    return { provider, model };
  }

  // إذا كان هناك تفكير، استخدم موديل التفكير
  if (req.body.thinking) {
    log('استخدام موديل التفكير لـ', req.body.thinking);
    const [provider, model] = req.config.Router.think.split(',');
    return { provider, model };
  }

  // الموديل الافتراضي
  return {
    provider: 'default',
    model: req.config.OPENAI_MODEL
  };
}

function router(req, res, next) {
  try {
    const { messages, system = [], tools } = req.body;
    let tokenCount = 0;

    // حساب عدد الرموز في الرسائل
    if (Array.isArray(messages)) {
      messages.forEach(message => {
        if (typeof message.content === 'string') {
          tokenCount += estimateTokens(message.content);
        } else if (Array.isArray(message.content)) {
          message.content.forEach(contentPart => {
            if (contentPart.type === 'text') {
              tokenCount += estimateTokens(contentPart.text);
            } else if (contentPart.type === 'tool_use') {
              tokenCount += estimateTokens(JSON.stringify(contentPart.input));
            } else if (contentPart.type === 'tool_result') {
              tokenCount += estimateTokens(
                typeof contentPart.content === 'string'
                  ? contentPart.content
                  : JSON.stringify(contentPart.content)
              );
            }
          });
        }
      });
    }

    // حساب عدد الرموز في رسائل النظام
    if (typeof system === 'string') {
      tokenCount += estimateTokens(system);
    } else if (Array.isArray(system)) {
      system.forEach(item => {
        if (item.type === 'text') {
          if (typeof item.text === 'string') {
            tokenCount += estimateTokens(item.text);
          } else if (Array.isArray(item.text)) {
            item.text.forEach(textPart => {
              tokenCount += estimateTokens(textPart || '');
            });
          }
        }
      });
    }

    // حساب عدد الرموز في الأدوات
    if (tools) {
      tools.forEach(tool => {
        if (tool.description) {
          tokenCount += estimateTokens(tool.name + tool.description);
        }
        if (tool.input_schema) {
          tokenCount += estimateTokens(JSON.stringify(tool.input_schema));
        }
      });
    }

    // تحديد الموديل والمقدم
    const { provider, model } = getUseModel(req, tokenCount);
    req.provider = provider;
    req.body.model = model;

    if (req.config?.log) {
      log('توجيه الطلب:', {
        provider,
        model,
        tokenCount,
        originalModel: req.body.model
      });
    }

    next();
  } catch (error) {
    log('خطأ في وسط التوجيه:', error.message);
    req.provider = 'default';
    req.body.model = req.config.OPENAI_MODEL;
    next();
  }
}

module.exports = { router };