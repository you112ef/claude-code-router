const { log } = require('./log');

async function streamOpenAIResponse(res, completion, model, originalRequest) {
  try {
    // إعداد headers للـ streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (originalRequest.stream) {
      // معالجة الـ streaming response
      for await (const chunk of completion) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          const claudeChunk = {
            type: 'content_block_delta',
            index: 0,
            delta: {
              type: 'text_delta',
              text: delta
            }
          };
          
          res.write(`data: ${JSON.stringify(claudeChunk)}\n\n`);
        }
      }
      
      // إرسال رسالة النهاية
      const endMessage = {
        type: 'message_stop'
      };
      res.write(`data: ${JSON.stringify(endMessage)}\n\n`);
    } else {
      // معالجة الاستجابة غير المتدفقة
      const content = completion.choices[0]?.message?.content || '';
      
      const claudeResponse = {
        id: `msg_${Date.now()}`,
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: content
          }
        ],
        model: model,
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: completion.usage?.prompt_tokens || 0,
          output_tokens: completion.usage?.completion_tokens || 0
        }
      };
      
      res.json(claudeResponse);
      return;
    }
    
    res.end();
  } catch (error) {
    log('خطأ في تدفق الاستجابة:', error.message);
    
    const errorResponse = {
      type: 'error',
      error: {
        type: 'api_error',
        message: error.message
      }
    };
    
    if (originalRequest.stream) {
      res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
      res.end();
    } else {
      res.status(500).json(errorResponse);
    }
  }
}

module.exports = { streamOpenAIResponse };