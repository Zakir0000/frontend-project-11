import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const rootDir = process.cwd();

export default {
  mode: 'development',
  entry: path.resolve(rootDir, 'src', 'index.js'),
  output: {
    path: path.resolve(rootDir, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(rootDir, 'index.html'),
    }),
  ],
  devServer: {
    open: true,
  },
};
