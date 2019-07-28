const path = require('path');
const config = require('./webpack.config.base');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    ...config,

    mode: 'development',
    devtool: 'source-map',

    devServer: {
        contentBase: path.resolve('public'),
        port: 8080,
        disableHostCheck: true,
        host: '0.0.0.0'
    },

    plugins: [
        ...config.plugins,

        new webpack.DefinePlugin({
            SERVICE_URL: '"http://localhost:8000"'
        }),

        // new BundleAnalyzerPlugin({
        //     analyzerMode: 'static'
        // })
    ]
};
