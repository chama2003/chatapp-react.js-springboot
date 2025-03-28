module.exports = {
    resolve: {
        fallback: {
            global: require.resolve('global'),
        },
    },
};
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
    plugins: [
        new NodePolyfillPlugin()
    ]
};
