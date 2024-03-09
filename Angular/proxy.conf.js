const PROXY_CONFIG = [
    {
        context: ['/api'],
        target: 'http://localhost:8080',
        // target: 'http://localhost:2900',
        secure: false,
        logLevel: 'debug',
        changeOrigin: true
    }
];

module.exports = PROXY_CONFIG;