const zopfli = require('@gfx/zopfli');
const CompressionPlugin = require('compression-webpack-plugin');
const config = require('./webpack.config.base');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');

module.exports = {
    ...config,
    mode: 'production',
    plugins: [
        ...config.plugins,

        new webpack.DefinePlugin({
            SERVICE_URL: '"/api"',
            IS_PRODUCTION: true,
        }),

        new CompressionPlugin({
            filename: '[path].gz[query]',
            minRatio: 0.8,
            algorithm: zopfli.gzip,
            compressionOptions: {
                numiterations: 15,
            },
        }),

        new CompressionPlugin({
            filename: '[path].br[query]',
            minRatio: 0.8,
            algorithm: 'brotliCompress',
        }),

        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
        }),
    ],
};
