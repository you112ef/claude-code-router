const express = require('express');
const cors = require('cors');

async function createServer(port) {
  const app = express();
  
  // إعداد الوسطاء الأساسية
  app.use(cors());
  app.use(express.json({ limit: '500mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  let serverInstance = null;
  
  return {
    app,
    useMiddleware: (middleware) => {
      app.use('/v1/messages', middleware);
    },
    start: () => {
      serverInstance = app.listen(port, '0.0.0.0', () => {
        console.log(`الخادم يعمل على المنفذ ${port}`);
      });
    },
    close: () => {
      if (serverInstance) {
        serverInstance.close();
        serverInstance = null;
      }
    }
  };
}

module.exports = { createServer };