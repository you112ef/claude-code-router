function rewriteBody(req, res, next) {
  try {
    // تطبيق الإضافات إذا كانت موجودة
    if (req.config?.usePlugins && Array.isArray(req.config.usePlugins)) {
      req.config.usePlugins.forEach(pluginName => {
        try {
          const plugin = require(`../plugins/${pluginName}`);
          if (plugin && typeof plugin.process === 'function') {
            req.body = plugin.process(req.body);
          }
        } catch (error) {
          console.log(`فشل في تحميل الإضافة ${pluginName}:`, error.message);
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error.message);
    next();
  }
}

module.exports = { rewriteBody };