const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	entry: {
		index: ["./src/app.js"],
		callback: ['./src/callback.js']
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
										corejs: 3,
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
		new CleanWebpackPlugin(),

		// Load only fr/es/en locales for moment in the bundle.
		new webpack.ContextReplacementPlugin(
			/moment[\/\\]locale$/,
			/(fr|es|en)\.js/
		),

		new HtmlWebpackPlugin({
			favicon: null,
			filename: 'index.html',
			template: 'src/template.html',
			inject: 'body',
			chunks: ['index']
		}),

		new HtmlWebpackPlugin({
			favicon: null,
			filename: 'callback.html',
			template: 'src/template.html',
			inject: 'body',
			chunks: ['callback']
		}),
	]
};

