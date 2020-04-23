const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        index: ['./src/index.js'],
    },

    // Output everything as a big bundle
    output: {
        path: path.resolve('dist'),
        filename: 'monitool2-[name]-[chunkhash].js',
    },

    node: false,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        targets: '> 0.25%, not dead',
                                        useBuiltIns: 'usage',
                                        corejs: 3, // still needed?
                                    },
                                ],
                            ],
                            plugins: ['angularjs-annotate', 'syntax-dynamic-import'],
                        },
                    },
                ],
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: { minimize: true },
                    },
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    { loader: 'sass-loader' },
                ],
            },
            {
                test: /\.css$/,
                use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
            },
            {
                test: /\.(svg|eot|woff|woff2|ttf)$/,
                use: [{ loader: 'file-loader' }],
            },
        ],
    },

    plugins: [
        // Clear /dist folder before building.
        new CleanWebpackPlugin(),

        // Define __moduleName, __templatePath, __scssPath and __componentName macros.
        new webpack.DefinePlugin({
            // 'components.pages.project-structure-basics.project-basics'
            __moduleName: webpack.DefinePlugin.runtimeValue(({ module }) => {
                const relPath = path.relative(path.join(__dirname, 'src'), module.resource);
                const moduleName = relPath.replace(/\//g, '.').replace(/\.[^/.]+$/, '');
                return `'${moduleName}'`;
            }),

            // './project-basics.html'
            __templatePath: webpack.DefinePlugin.runtimeValue(({ module }) => {
                const basename = path.basename(module.resource, '.js');
                return `'./${basename}.html'`;
            }),

            // './project-basics.css'
            __scssPath: webpack.DefinePlugin.runtimeValue(({ module }) => {
                const basename = path.basename(module.resource, '.js');
                return `'./${basename}.scss'`;
            }),

            // 'projectBasics'
            __componentName: webpack.DefinePlugin.runtimeValue(({ module }) => {
                const basename = path.basename(module.resource, '.js');
                const camelBaseName = basename.replace(/-[a-z]/g, v => v[1].toUpperCase());
                return `'${camelBaseName}'`;
            }),
        }),

        // Only load fr/es/en locales for moment in the bundle.
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(fr|es|en)\.js/),

        new HtmlWebpackPlugin({
            favicon: null,
            filename: 'index.html',
            template: './src/template.html',
            inject: 'body',
            chunks: ['index'],
        }),
    ],
};
