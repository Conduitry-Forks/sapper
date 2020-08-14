'use strict';

var env = require('./env.js');

var webpack = {
    dev: env.dev,
    client: {
        entry: function () {
            return {
                main: env.src + "/client"
            };
        },
        output: function () {
            return {
                path: env.dest + "/client",
                filename: '[hash]/[name].js',
                chunkFilename: '[hash]/[name].[id].js',
                publicPath: "client/"
            };
        }
    },
    server: {
        entry: function () {
            return {
                server: env.src + "/server"
            };
        },
        output: function () {
            return {
                path: env.dest + "/server",
                filename: '[name].js',
                chunkFilename: '[hash]/[name].[id].js',
                publicPath: "client/",
                libraryTarget: 'commonjs2'
            };
        }
    },
    serviceworker: {
        entry: function () {
            return {
                'service-worker': env.src + "/service-worker"
            };
        },
        output: function () {
            return {
                path: env.dest,
                filename: '[name].js',
                chunkFilename: '[name].[id].[hash].js'
            };
        }
    }
};

module.exports = webpack;
//# sourceMappingURL=webpack.js.map
