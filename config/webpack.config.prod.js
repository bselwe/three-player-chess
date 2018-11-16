const paths = require("./paths");
const merge = require("webpack-merge");

const HtmlWebpackIncludeAssetsPlugin = require("html-webpack-include-assets-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const CommonConfig = require("./webpack.config.common.js");

module.exports = merge(CommonConfig, {
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    output: {
                        comments: false,
                    },
                    mangle: true
                }
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ],

    module: {
        rules: [{
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader?localIdentName=[hash:base64:20]&modules&importLoaders=1&sourceMap"
                ]
            },
            {
                test: /\.sass$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader?localIdentName=[hash:base64:20]&modules&importLoaders=1&sourceMap",
                    "sass-loader"
                ]
            }
        ]
    }
});
