const path = require('path');
const config = require('./webpack.config.base');
const webpack = require('webpack');

module.exports = {
    ...config,

    mode: 'development',
    devtool: 'source-map',

    devServer: {
        static: { directory: path.resolve('./static') },
        port: 8080,
        compress: false,
        allowedHosts: 'all',
        host: '0.0.0.0',
        proxy: [
            {
                context: ['/api'],
                target: 'http://localhost:8000',
                pathRewrite: { '^/api': '' },
            },
        ],
        devMiddleware: { publicPath: '/' },
        watchFiles: { options: { ignored: /node_modules/ } },
        hot: false,
        liveReload: true,
    },

    plugins: [
        ...config.plugins,
        new webpack.DefinePlugin({
            SERVICE_URL: '"/api"',
            IS_PRODUCTION: false,
        }),
    ],
};
