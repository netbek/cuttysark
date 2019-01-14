const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const {browserslist} = require('./package.json');

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: ['node_modules/']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader?cacheDirectory',
        options: {
          babelrc: false,
          comments: false,
          env: {
            development: {
              plugins: [
                'transform-object-assign',
                ['transform-object-rest-spread', {useBuiltIns: false}],
                'transform-remove-strict-mode'
              ]
            },
            production: {
              plugins: [
                'transform-object-assign',
                ['transform-object-rest-spread', {useBuiltIns: false}],
                'transform-react-remove-prop-types',
                'transform-remove-strict-mode'
              ]
            }
          },
          plugins: [],
          presets: [
            [
              'env',
              {
                exclude: [
                  'transform-async-to-generator',
                  'transform-regenerator'
                ],
                loose: true,
                modules: 'commonjs',
                targets: {
                  browsers: browserslist
                },
                useBuiltIns: false
              }
            ],
            'stage-2',
            'react'
          ]
        }
      }
    ]
  },
  externals: {
    'jquery/dist/jquery.slim': 'jQuery',
    'lodash-3/lodash': '_',
    'picturefill/dist/picturefill': 'picturefill'
  },
  mode: 'production',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        include: /\.min\.js$/
      })
    ]
  }
};
