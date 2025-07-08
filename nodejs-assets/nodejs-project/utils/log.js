const rn_bridge = require('rn-bridge');

function log(...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  const logEntry = `[${timestamp}] ${message}`;
  
  // طباعة في وحدة التحكم
  console.log(logEntry);
  
  // إرسال السجل إلى React Native
  try {
    rn_bridge.channel.send({
      type: 'log',
      data: {
        timestamp,
        message,
        level: 'info'
      }
    });
  } catch (error) {
    console.error('فشل في إرسال السجل:', error.message);
  }
}

function logError(...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  const logEntry = `[${timestamp}] ERROR: ${message}`;
  
  console.error(logEntry);
  
  try {
    rn_bridge.channel.send({
      type: 'log',
      data: {
        timestamp,
        message,
        level: 'error'
      }
    });
  } catch (error) {
    console.error('فشل في إرسال سجل الخطأ:', error.message);
  }
}

module.exports = { log, logError };