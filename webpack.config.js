var webpack = require('webpack');

module.exports = {
  entry: __dirname + '/entry.js',
  output: {
    path: __dirname + '/client',
    filename: 'bundle.js',
    library: 'csvTransformer'
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}