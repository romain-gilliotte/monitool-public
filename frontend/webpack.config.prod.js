const zopfli = require('@gfx/zopfli');
const CompressionPlugin = require('compression-webpack-plugin');
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
            patterns: [{ from: path.resolve('../presentation') }],
        }),

        new webpack.DefinePlugin({
            SERVICE_URL: '"/api"',
            IS_PRODUCTION: true,
        }),

        new CompressionPlugin({
            filename: '[file].gz[query]',
            minRatio: 0.8,
            algorithm: zopfli.gzip,
            compressionOptions: {
                numiterations: 15,
            },
        }),

        new CompressionPlugin({
            filename: '[file].br[query]',
            minRatio: 0.8,
            algorithm: 'brotliCompress',
        }),

        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
        }),
    ],
};
