var webpack = require('webpack');
var path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'inline-sourcemap',
    entry: {
        javascript: './webpack/entry.js'
    },
    output: {
        path: path.join(__dirname, '../public'),
        filename: 'csv-transformer.bundle.js',
        library: 'csvTransformer'
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: 'file-loader?name=[name].[ext]'
            }
        ]
    }
};
