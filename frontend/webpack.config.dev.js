const path = require('path');
const config = require('./webpack.config.base');
const webpack = require('webpack');

module.exports = {
    ...config,

    mode: 'development',
    devtool: 'source-map',

    devServer: {
        contentBase: path.resolve('public'),
        port: 8080,
        compress: true,
        disableHostCheck: true,
        host: '0.0.0.0',
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                pathRewrite: { '^/api': '' }
            }
        }
    },

    plugins: [
        ...config.plugins,
        new webpack.DefinePlugin({
            SERVICE_URL: '"/api"',
            IS_PRODUCTION: false,
        }),
    ]
};
