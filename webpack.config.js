// This library allows us to combine paths easily
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'distribution', "latest"),
    filename: 'rdfa.js',
    libraryTarget: 'var',
    library: 'RDFa'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { 
              presets: ['env']
            }
        }
      }
    ],
  },
  externals: {
    'node-fetch': 'fetch',
    'ndjs': 'window'
  },
  devtool: 'source-map'
};