'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _commonjsHelpers = require('./_commonjsHelpers.js');
var path = require('path');
var path__default = _interopDefault(path);
var fs = require('fs');
var create_manifest_data = require('./create_manifest_data.js');
require('module');
require('./index.js');
require('string-hash');
require('sourcemap-codec');
require('./env.js');
var copy_runtime = require('./copy_runtime.js');
var fs_utils = require('./fs_utils.js');
require('html-minifier');
var minify_html = require('./minify_html.js');

function read_template(dir) {
    try {
        return fs.readFileSync(dir + "/template.html", 'utf-8');
    }
    catch (err) {
        if (fs.existsSync("app/template.html")) {
            throw new Error("As of Sapper 0.21, the default folder structure has been changed:\n  app/    --> src/\n  routes/ --> src/routes/\n  assets/ --> static/");
        }
        throw err;
    }
}

function build(_a) {
    var _b = _a === void 0 ? {} : _a, cwd = _b.cwd, _c = _b.src, src = _c === void 0 ? 'src' : _c, _d = _b.routes, routes = _d === void 0 ? 'src/routes' : _d, _e = _b.output, output = _e === void 0 ? 'src/node_modules/@sapper' : _e, _f = _b.static, static_files = _f === void 0 ? 'static' : _f, _g = _b.dest, dest = _g === void 0 ? '__sapper__/build' : _g, bundler = _b.bundler, _h = _b.legacy, legacy = _h === void 0 ? false : _h, ext = _b.ext, _j = _b.oncompile, oncompile = _j === void 0 ? fs_utils.noop : _j;
    return _commonjsHelpers.__awaiter(this, void 0, void 0, function () {
        var template, manifest_data, _k, client, server, serviceworker, client_result, build_info, client_1, client_result_1, server_stats, serviceworker_stats, client_files;
        return _commonjsHelpers.__generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    bundler = copy_runtime.validate_bundler(bundler);
                    cwd = path.resolve(cwd);
                    src = path.resolve(cwd, src);
                    dest = path.resolve(cwd, dest);
                    routes = path.resolve(cwd, routes);
                    output = path.resolve(cwd, output);
                    static_files = path.resolve(cwd, static_files);
                    if (legacy && bundler === 'webpack') {
                        throw new Error("Legacy builds are not supported for projects using webpack");
                    }
                    fs_utils.rimraf(output);
                    fs_utils.mkdirp(output);
                    copy_runtime.copy_runtime(output);
                    fs_utils.rimraf(dest);
                    fs_utils.mkdirp(dest + "/client");
                    copy_runtime.copy_shimport(dest);
                    template = read_template(src);
                    fs.writeFileSync(dest + "/template.html", minify_html.minify_html(template));
                    manifest_data = create_manifest_data.create_manifest_data(routes, ext);
                    // create src/node_modules/@sapper/app.mjs and server.mjs
                    create_manifest_data.create_app({
                        bundler: bundler,
                        manifest_data: manifest_data,
                        cwd: cwd,
                        src: src,
                        dest: dest,
                        routes: routes,
                        output: output,
                        dev: false
                    });
                    return [4 /*yield*/, create_manifest_data.create_compilers(bundler, cwd, src, dest, false)];
                case 1:
                    _k = _l.sent(), client = _k.client, server = _k.server, serviceworker = _k.serviceworker;
                    return [4 /*yield*/, client.compile()];
                case 2:
                    client_result = _l.sent();
                    oncompile({
                        type: 'client',
                        result: client_result
                    });
                    build_info = client_result.to_json(manifest_data, { src: src, routes: routes, dest: dest });
                    if (!legacy) return [3 /*break*/, 5];
                    process.env.SAPPER_LEGACY_BUILD = 'true';
                    return [4 /*yield*/, create_manifest_data.create_compilers(bundler, cwd, src, dest, false)];
                case 3:
                    client_1 = (_l.sent()).client;
                    return [4 /*yield*/, client_1.compile()];
                case 4:
                    client_result_1 = _l.sent();
                    oncompile({
                        type: 'client (legacy)',
                        result: client_result_1
                    });
                    client_result_1.to_json(manifest_data, { src: src, routes: routes, dest: dest });
                    build_info.legacy_assets = client_result_1.assets;
                    delete process.env.SAPPER_LEGACY_BUILD;
                    _l.label = 5;
                case 5:
                    fs.writeFileSync(path.join(dest, 'build.json'), JSON.stringify(build_info));
                    return [4 /*yield*/, server.compile()];
                case 6:
                    server_stats = _l.sent();
                    oncompile({
                        type: 'server',
                        result: server_stats
                    });
                    if (!serviceworker) return [3 /*break*/, 8];
                    client_files = client_result.chunks
                        .filter(function (chunk) { return !chunk.file.endsWith('.map'); }) // SW does not need to cache sourcemap files
                        .map(function (chunk) { return "client/" + chunk.file; });
                    create_manifest_data.create_serviceworker_manifest({
                        manifest_data: manifest_data,
                        output: output,
                        client_files: client_files,
                        static_files: static_files
                    });
                    return [4 /*yield*/, serviceworker.compile()];
                case 7:
                    serviceworker_stats = _l.sent();
                    oncompile({
                        type: 'serviceworker',
                        result: serviceworker_stats
                    });
                    _l.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    });
}

exports.build = build;
//# sourceMappingURL=build.js.map
