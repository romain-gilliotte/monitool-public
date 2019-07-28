const zopfli = require('@gfx/zopfli');
const CompressionPlugin = require('compression-webpack-plugin');
const brotli = require('iltorb');
const config = require('./webpack.config.base');

module.exports = {
    ...config,
    mode: 'production',
    plugins: [
        ...config.plugins,

        new webpack.DefinePlugin({
            SERVICE_URL: '"https://api.monitool.org"'
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
            algorithm: brotli.compress
        })
    ]
}
