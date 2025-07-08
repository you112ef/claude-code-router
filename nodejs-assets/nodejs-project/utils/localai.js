const rn_bridge = require('rn-bridge');
const { log } = require('./log');

class LocalAIProvider {
  constructor() {
    this.isAvailable = false;
    this.currentModel = null;
    this.isLoading = false;
  }

  async initialize() {
    try {
      // التحقق من توفر النموذج المحلي
      this.isAvailable = true;
      log('LocalAI Provider initialized');
      return true;
    } catch (error) {
      log('Failed to initialize LocalAI Provider:', error.message);
      return false;
    }
  }

  async createCompletion(messages, options = {}) {
    try {
      if (!this.isAvailable) {
        throw new Error('LocalAI Provider not available');
      }

      // تحويل الرسائل إلى prompt
      const prompt = this.formatMessages(messages);
      
      // إرسال طلب للنموذج المحلي عبر React Native Bridge
      const result = await this.generateText(prompt, options);
      
      // تحويل النتيجة إلى تنسيق OpenAI
      return this.formatResponse(result, options);
      
    } catch (error) {
      log('Error in LocalAI completion:', error.message);
      throw error;
    }
  }

  async generateText(prompt, options = {}) {
    return new Promise((resolve, reject) => {
      const requestId = Date.now().toString();
      
      // إرسال طلب توليد النص
      rn_bridge.channel.send({
        type: 'localai_generate',
        requestId,
        prompt,
        options: {
          maxTokens: options.max_tokens || 512,
          temperature: options.temperature || 0.7,
          topP: options.top_p || 0.9,
          topK: options.top_k || 40,
        }
      });

      // الاستماع للاستجابة
      const responseHandler = (msg) => {
        if (msg.type === 'localai_response' && msg.requestId === requestId) {
          rn_bridge.channel.removeListener('message', responseHandler);
          
          if (msg.error) {
            reject(new Error(msg.error));
          } else {
            resolve(msg.result);
          }
        }
      };

      rn_bridge.channel.addListener('message', responseHandler);

      // timeout للطلب
      setTimeout(() => {
        rn_bridge.channel.removeListener('message', responseHandler);
        reject(new Error('LocalAI request timeout'));
      }, 30000); // 30 ثانية timeout
    });
  }

  formatMessages(messages) {
    let prompt = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        prompt += `النظام: ${message.content}\n\n`;
      } else if (message.role === 'user') {
        prompt += `المستخدم: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        prompt += `المساعد: ${message.content}\n\n`;
      }
    }
    
    prompt += 'المساعد: ';
    return prompt;
  }

  formatResponse(localResult, options) {
    // تنسيق الاستجابة لتطابق OpenAI API
    const response = {
      id: `localai-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'local-ai-model',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: localResult.text || 'عذراً، لم أتمكن من توليد إجابة.'
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: this.estimateTokens(options.prompt || ''),
        completion_tokens: localResult.tokensGenerated || 0,
        total_tokens: this.estimateTokens(options.prompt || '') + (localResult.tokensGenerated || 0)
      },
      local_ai: {
        inference_time: localResult.inferenceTime || 0,
        model_type: this.currentModel?.type || 'unknown'
      }
    };

    return response;
  }

  async createStreamCompletion(messages, options = {}) {
    try {
      // للبساطة، سنستخدم الاستجابة العادية ونحولها إلى stream
      const completion = await this.createCompletion(messages, options);
      const content = completion.choices[0].message.content;
      
      // محاكاة streaming
      return this.simulateStream(content);
      
    } catch (error) {
      log('Error in LocalAI stream completion:', error.message);
      throw error;
    }
  }

  async *simulateStream(content) {
    const words = content.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const chunk = {
        id: `localai-stream-${Date.now()}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: 'local-ai-model',
        choices: [
          {
            index: 0,
            delta: {
              content: (i === 0 ? '' : ' ') + words[i]
            },
            finish_reason: null
          }
        ]
      };
      
      yield chunk;
      
      // تأخير صغير لمحاكاة الـ streaming
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }

    // chunk نهائي
    yield {
      id: `localai-stream-${Date.now()}`,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: 'local-ai-model',
      choices: [
        {
          index: 0,
          delta: {},
          finish_reason: 'stop'
        }
      ]
    };
  }

  estimateTokens(text) {
    // تقدير تقريبي لعدد الرموز
    return Math.ceil(text.length / 4);
  }

  setCurrentModel(modelInfo) {
    this.currentModel = modelInfo;
    log('LocalAI current model set:', modelInfo);
  }

  isModelLoaded() {
    return this.currentModel !== null && this.isAvailable;
  }

  getModelInfo() {
    return this.currentModel;
  }
}

// إنشاء مثيل واحد
const localAIProvider = new LocalAIProvider();

module.exports = { localAIProvider };