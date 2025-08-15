const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const webpack = require("webpack")

module.exports = {
  entry: "./src/js/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "img/[name][ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
    }),
    new webpack.DefinePlugin({
      "process.env.WEATHER_API_KEY": JSON.stringify(process.env.WEATHER_API_KEY || ""),
      __WEATHER_API_KEY__: JSON.stringify(process.env.WEATHER_API_KEY || ""),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 3000,
    hot: true,
    proxy: {
      "/weatherapi": {
        target: "https://api.weatherapi.com",
        changeOrigin: true,
        secure: false,
        pathRewrite: { "^/weatherapi": "" },
      },
    },
  },
}
