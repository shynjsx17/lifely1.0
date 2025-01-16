const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/lifely1.0/backend',
    createProxyMiddleware({
      target: 'http://localhost',
      changeOrigin: true,
      secure: false,
      headers: {
        Connection: 'keep-alive'
      }
    })
  );
}; 