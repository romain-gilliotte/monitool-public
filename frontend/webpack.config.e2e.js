const webpack = require('webpack');
const devConfig = require('./webpack.config.dev');

// E2E build: same as the dev server (proxy /api -> localhost:8000, live reload),
// but with AUTH_DISABLED injected so the app bypasses Auth0 and bootstraps
// directly with a fixed test profile. Opt-in only: AUTH_DISABLED is never
// defined by webpack.config.dev.js / webpack.config.prod.js, so the bypass
// branch in src/index.js is dead code (and tree-shaken) in dev/prod builds.
module.exports = {
    ...devConfig,

    plugins: [
        ...devConfig.plugins,
        new webpack.DefinePlugin({
            AUTH_DISABLED: true,
        }),
    ],
};
