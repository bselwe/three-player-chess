
const webpack = require("webpack");
const path = require("path");
const paths = require("./paths");
const merge = require("webpack-merge");

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CommonConfig = require("./webpack.config.common.js");

module.exports = merge(CommonConfig, {
    devtool: "source-map",

    entry: [
        "webpack-dev-server/client?http://localhost:8080",
    ],

    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new ExtractTextPlugin({
            filename: "styles.css",
            allChunks: true
        })
    ],

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader", use: "css-loader",
                })
            },
            {
                test: /\.sass$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader", use: "css-loader!sass-loader",
                })
            }
            // {
            //     test: /\.css$/,
            //     use: [
            //         "style-loader",
            //         "css-loader?localIdentName=[folder]__[name]__[local]&modules&importLoaders=1&sourceMap"
            //     ]
            // },
            // {
            //     test: /\.sass$/,
            //     use: [
            //         "style-loader",
            //         "css-loader?localIdentName=[folder]__[name]__[local]&modules&importLoaders=1&sourceMap",
            //         "sass-loader"
            //     ]
            // }
        ]
    },

    devServer: {
        contentBase: path.join(paths.root, "dist"),
        publicPath: "/",
        disableHostCheck: true,

        host: "0.0.0.0",
        port: 8080,
        historyApiFallback: true
    }
});
