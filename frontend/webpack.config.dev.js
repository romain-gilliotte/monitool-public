const path = require('path');
const config = require('./webpack.config.base');
const webpack = require('webpack');

module.exports = {
    ...config,

    mode: 'development',
    devtool: 'source-map',

    devServer: {
        contentBase: path.resolve('./static'),
        port: 8080,
        compress: false,
        disableHostCheck: true,
        host: '0.0.0.0',
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                pathRewrite: { '^/api': '' },
            },
        },
        publicPath: '/', // @see https://github.com/webpack/webpack-dev-server/issues/2745
        watchOptions: {
            ignored: /node_modules/, // Reduce inotify watches usages
        },
    },

    plugins: [
        ...config.plugins,
        new webpack.DefinePlugin({
            SERVICE_URL: '"/api"',
            IS_PRODUCTION: false,
        }),
    ],
};
