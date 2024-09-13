const path = require('path');

module.exports = {
  watch: true,
  mode: 'development',
  entry: './src/app.mjs',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        type: 'javascript/auto', // Bu satırı ekleyin
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.m?js$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules/react-slick'),
        ],
        use: {
          loader: 'babel-loader',
        },
      },
      
      {
        test: /\.scss$/, // SCSS dosyaları için kural
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/, // CSS dosyaları için kural
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/, // Görseller için kural (gerekliyse)
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.mjs', '.jsx', '.ts', '.tsx'],
  },
};
