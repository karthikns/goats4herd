const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './src/client/js/app.js',
        admin: './src/client/js/admin.js',
        stats: './src/client/js/stats.js'
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/client/index.html',
            chunks: ['app']
        }),
        new HtmlWebpackPlugin({
            filename: 'about.html',
            template: 'src/client/about.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'admin.html',
            template: 'src/client/admin.html',
            chunks: ['admin']
        }),
        new HtmlWebpackPlugin({
            filename: 'stats.html',
            template: 'src/client/stats.html',
            chunks: ['stats']
        }),
    ],
};