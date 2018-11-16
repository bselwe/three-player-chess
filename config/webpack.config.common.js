const path = require("path");
const paths = require("./paths");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");
const HappyPack = require("happypack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const deployDir = process.env.DEPLOY_DIR || path.resolve(__dirname, "..", "deploy");

module.exports = {
    entry: [
        path.join(paths.ts, "index.ts"),
        path.join(paths.styles, "index.sass"),
    ],

    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(paths.root, "index.html")
        }),
        new ForkTsCheckerPlugin({
            checkSyntacticErrors: true,
            tsconfig: paths.tsConfig,
            tslint: paths.tsLint,
            watch: paths.ts,
            async: false
        }),
        new HappyPack({
            id: "ts",
            loaders: [{
                path: "ts-loader",
                query: {
                    happyPackMode: true,
                    configFile: paths.tsConfig
                }
            }]
        }),
        new CopyWebpackPlugin([
            { from: "images", to: "images" }
        ])
    ],

    output: {
        path: path.resolve(deployDir),
        filename: "[name].js",
        publicPath: "/"
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            {
                test: /\.(tsx?|js)$/,
                loader: "happypack/loader?id=ts",
                include: paths.ts
            },
            {
                test: /\.(jpg|png|svg|gif)$/,
                loader: "file-loader",
                options: {
                    name: "images/[name].[ext]"
                }
            }
        ]
    }
};
