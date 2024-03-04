const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const config = require('./webpack.config.base');

module.exports = {
    ...config,
    mode: 'production',
    plugins: [
        ...config.plugins,

        new CopyPlugin({
            patterns: [{ from: path.resolve('./static') }],
        }),

        new webpack.DefinePlugin({
            SERVICE_URL: '"/api"',
            IS_PRODUCTION: true,
        }),

        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
        }),
    ],
};
