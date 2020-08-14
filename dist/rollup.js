'use strict';

var env = require('./env.js');

var sourcemap = env.dev ? 'inline' : false;
var rollup = {
    dev: env.dev,
    client: {
        input: function () {
            return env.src + "/client.js";
        },
        output: function () {
            var dir = env.dest + "/client";
            if (process.env.SAPPER_LEGACY_BUILD)
                dir += "/legacy";
            return {
                dir: dir,
                entryFileNames: '[name].[hash].js',
                chunkFileNames: '[name].[hash].js',
                format: 'esm',
                sourcemap: sourcemap
            };
        }
    },
    server: {
        input: function () {
            return {
                server: env.src + "/server.js"
            };
        },
        output: function () {
            return {
                dir: env.dest + "/server",
                format: 'cjs',
                sourcemap: sourcemap
            };
        }
    },
    serviceworker: {
        input: function () {
            return env.src + "/service-worker.js";
        },
        output: function () {
            return {
                file: env.dest + "/service-worker.js",
                format: 'iife',
                sourcemap: sourcemap
            };
        }
    }
};

module.exports = rollup;
//# sourceMappingURL=rollup.js.map
