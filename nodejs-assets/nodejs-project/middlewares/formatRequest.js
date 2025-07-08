const { log } = require('../utils/log');

function formatRequest(req, res, next) {
  try {
    // تحويل طلب Claude إلى تنسيق OpenAI
    const claudeBody = req.body;
    
    // إنشاء رسائل بتنسيق OpenAI
    const messages = [];
    
    // إضافة رسالة النظام إذا كانت موجودة
    if (claudeBody.system) {
      if (typeof claudeBody.system === 'string') {
        messages.push({
          role: 'system',
          content: claudeBody.system
        });
      } else if (Array.isArray(claudeBody.system)) {
        claudeBody.system.forEach(item => {
          if (item.type === 'text') {
            messages.push({
              role: 'system',
              content: item.text
            });
          }
        });
      }
    }
    
    // إضافة الرسائل
    if (Array.isArray(claudeBody.messages)) {
      claudeBody.messages.forEach(message => {
        const openaiMessage = {
          role: message.role,
          content: ''
        };
        
        if (typeof message.content === 'string') {
          openaiMessage.content = message.content;
        } else if (Array.isArray(message.content)) {
          // تجميع النصوص من المحتوى المتعدد
          const textParts = [];
          message.content.forEach(part => {
            if (part.type === 'text') {
              textParts.push(part.text);
            } else if (part.type === 'tool_use') {
              textParts.push(`Tool: ${part.name}\nInput: ${JSON.stringify(part.input)}`);
            } else if (part.type === 'tool_result') {
              textParts.push(`Tool Result: ${typeof part.content === 'string' ? part.content : JSON.stringify(part.content)}`);
            }
          });
          openaiMessage.content = textParts.join('\n\n');
        }
        
        messages.push(openaiMessage);
      });
    }
    
    // إنشاء طلب OpenAI
    const openaiRequest = {
      model: req.body.model || 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: claudeBody.max_tokens || 4000,
      temperature: claudeBody.temperature || 0.7,
      stream: claudeBody.stream || false
    };
    
    // إضافة الأدوات إذا كانت موجودة
    if (claudeBody.tools && Array.isArray(claudeBody.tools)) {
      openaiRequest.tools = claudeBody.tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.input_schema
        }
      }));
    }
    
    req.body = openaiRequest;
    
    if (req.config?.log) {
      log('تم تحويل الطلب:', {
        provider: req.provider,
        model: req.body.model,
        messagesCount: messages.length
      });
    }
    
    next();
  } catch (error) {
    log('خطأ في تحويل الطلب:', error.message);
    res.status(400).json({ error: 'فشل في تحويل الطلب' });
  }
}

module.exports = { formatRequest };