const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const pages = ["index"];
const isDev = process.env.NODE_ENV === "development";
module.exports = {
  entry: "./src/index.js",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
        ],
      },
    ],
  },

  plugins: [
    ...pages.map(
      (page) =>
        new HtmlWebpackPlugin({
          template: `./src/${page}.html`,
          filename: `${page}.html`,
        })
    ),

    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, "src/img"), to: "img" }],
    }),

    new MiniCssExtractPlugin({
      filename: "styles.css",
    }),
  ],

  devServer: {
    static: { directory: path.join(__dirname, "dist") },
    compress: true,
    port: 8080,
    open: true,
    hot: true,
    watchFiles: ["src/**/*.html"],
  },

  devtool: "source-map",

  mode: isDev ? "development" : "production",
};
