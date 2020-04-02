const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	entry: {
		index: ["./src/app.js"]
	},

	// Output everything as a big bundle
	output: {
		path: path.resolve('dist'),
		filename: 'monitool2-[name]-[chunkhash].js'
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							"presets": [
								[
									"@babel/preset-env",
									{
										targets: "> 0.25%, not dead",
										useBuiltIns: "usage",
										corejs: 3, // still needed?
									}
								]
							],
							"plugins": ["angularjs-annotate", "syntax-dynamic-import"]
						}
					}
				]
			},
			{
				test: /\.html$/,
				use: [
					{
						loader: 'html-loader',
						options: { minimize: true }
					}
				]
			},
			{
				test: /\.css$/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' }
				]
			},
			{
				test: /\.(svg|eot|woff|woff2|ttf)$/,
				use: [
					{ loader: 'file-loader' }
				]
			}
		]
	},

	plugins: [
		// Clear /dist folder before building.
		new CleanWebpackPlugin(),

		// Define __moduleName, __templatePath, __cssPath and __componentName macros.
		// This makes it much easier to move files around when bearing with AngularJS module system.
		new webpack.DefinePlugin({
			__moduleName: webpack.DefinePlugin.runtimeValue(
				({ module }) => {
					const relPath = path.relative(path.join(__dirname, 'src'), module.resource);
					const moduleName = relPath.replace(/\//g, '.').replace(/\.[^/.]+$/, "");
					return `'${moduleName}'`;
				}
			),
			__templatePath: webpack.DefinePlugin.runtimeValue(
				({ module }) => {
					const basename = path.basename(module.resource, '.js');
					return `'./${basename}.html'`;
				}
			),
			__cssPath: webpack.DefinePlugin.runtimeValue(
				({ module }) => {
					const basename = path.basename(module.resource, '.js');
					return `'./${basename}.css'`
				}
			),
			__componentName: webpack.DefinePlugin.runtimeValue(
				({ module }) => {
					const basename = path.basename(module.resource, '.js');
					const camelBaseName = basename.replace(/-[a-z]/g, v => v[1].toUpperCase());
					return `'${camelBaseName}'`;
				}
			),
		}),

		// Only load fr/es/en locales for moment in the bundle.
		new webpack.ContextReplacementPlugin(
			/moment[\/\\]locale$/,
			/(fr|es|en)\.js/
		),

		new HtmlWebpackPlugin({
			favicon: null,
			filename: 'index.html',
			template: './src/template.html',
			inject: 'body',
			chunks: ['index']
		})
	]
};

