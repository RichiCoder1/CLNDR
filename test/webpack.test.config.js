const {resolve, join} = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: resolve(__dirname, 'test.js'),
  context: resolve(__dirname, ".."),
  module: {
    rules: [
      {
        test:/\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.html$/,
        use: { loader: 'html-loader' }
      }
    ]
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: resolve(__dirname),
    port: 9001,
    open: true,
    openPage: '/test.compiled.html',
    overlay: true
  },
  resolve: {
    alias: {
      'clndr': resolve(__dirname, "..", "dist", "clndr.js")
    }
  },
  output: {
    path: __dirname,
    filename: 'test.compiled.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'test.compiled.html',
      template: resolve(__dirname, 'test.html')
    })
  ]
};