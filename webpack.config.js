const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',
  entry: './src/clndr.ts',
  resolve: {
    extensions: ['.js', '.mjs', '.ts', '.json', '.wasm']
  },
  module: {
    rules: [
      {
        test:/\.(m?j|t)s$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  externals: [nodeExternals()],
  output: {
    filename: 'clndr.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'clndr',
    libraryTarget: 'umd'
  }
};