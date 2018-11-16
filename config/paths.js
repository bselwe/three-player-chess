const path = require("path");

const root = path.resolve(__dirname, "..");
const ts = path.join(root, "ts");
const styles = path.join(root, "styles");
const tsConfig = path.join(root, "tsconfig.json");
const tsLint = path.join(root, "tslint.json");

module.exports = {
    root,
    ts,
    styles,
    tsConfig,
    tsLint
}
