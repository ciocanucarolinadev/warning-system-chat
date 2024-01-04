const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node',
    externals: [nodeExternals()],
    resolve: {
        fallback: {
          path: require.resolve("path-browserify")
        }
      }      
}