const path = require('path');

module.exports = {
  mode: 'production', // หรือ 'development' หากต้องการ
  entry: {
    background: './background.js',
    content: './content.js',
   

  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // ถ้าต้องการใช้ Babel
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
