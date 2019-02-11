const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  resolve: {
    extensions: ['.js', '.ts', '.json', '.wasm']
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
    filename: 'clndrfx.umd.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'clndrfx',
    libraryTarget: 'umd'
  }
};