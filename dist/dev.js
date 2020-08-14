'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _commonjsHelpers = require('./_commonjsHelpers.js');
var path = require('path');
var path__default = _interopDefault(path);
var fs = require('fs');
var http = require('http');
var http__default = _interopDefault(http);
var child_process = require('child_process');
require('net');
var Deferred = require('./Deferred.js');
var EventEmitter = require('events');
var create_manifest_data = require('./create_manifest_data.js');
require('module');
require('./index.js');
require('string-hash');
require('sourcemap-codec');
require('./env.js');
var copy_runtime = require('./copy_runtime.js');
var fs_utils = require('./fs_utils.js');

function dev(opts) {
    return new Watcher(opts);
}
var Watcher = /** @class */ (function (_super) {
    _commonjsHelpers.__extends(Watcher, _super);
    function Watcher(_a) {
        var _b = _a.cwd, cwd = _b === void 0 ? '.' : _b, _c = _a.src, src = _c === void 0 ? 'src' : _c, _d = _a.routes, routes = _d === void 0 ? 'src/routes' : _d, _e = _a.output, output = _e === void 0 ? 'src/node_modules/@sapper' : _e, _f = _a.static, static_files = _f === void 0 ? 'static' : _f, _g = _a.dest, dest = _g === void 0 ? '__sapper__/dev' : _g, dev_port = _a["dev-port"], live = _a.live, hot = _a.hot, devtools_port = _a["devtools-port"], bundler = _a.bundler, _h = _a.port, port = _h === void 0 ? +process.env.PORT : _h, ext = _a.ext;
        var _this = _super.call(this) || this;
        cwd = path.resolve(cwd);
        _this.bundler = copy_runtime.validate_bundler(bundler);
        _this.dirs = {
            cwd: cwd,
            src: path.resolve(cwd, src),
            dest: path.resolve(cwd, dest),
            routes: path.resolve(cwd, routes),
            output: path.resolve(cwd, output),
            static: path.resolve(cwd, static_files)
        };
        _this.ext = ext;
        _this.port = port;
        _this.closed = false;
        _this.dev_port = dev_port;
        _this.live = live;
        _this.hot = hot;
        _this.devtools_port = devtools_port;
        _this.filewatchers = [];
        _this.current_build = {
            changed: new Set(),
            rebuilding: new Set(),
            unique_errors: new Set(),
            unique_warnings: new Set()
        };
        process.env.NODE_ENV = 'development';
        process.on('exit', function () {
            _this.close();
        });
        _this.init();
        return _this;
    }
    Watcher.prototype.init = function () {
        return _commonjsHelpers.__awaiter(this, void 0, void 0, function () {
            var _a, _b, cwd, src, dest, routes, output, static_files, _c, _d, manifest_data, deferred, compilers, emitFatal, watch_serviceworker;
            var _this = this;
            return _commonjsHelpers.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!this.port) return [3 /*break*/, 2];
                        return [4 /*yield*/, Deferred.check(this.port)];
                    case 1:
                        if (!(_e.sent())) {
                            this.emit('fatal', {
                                message: "Port " + this.port + " is unavailable"
                            });
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        _a = this;
                        return [4 /*yield*/, Deferred.find(3000)];
                    case 3:
                        _a.port = _e.sent();
                        _e.label = 4;
                    case 4:
                        _b = this.dirs, cwd = _b.cwd, src = _b.src, dest = _b.dest, routes = _b.routes, output = _b.output, static_files = _b.static;
                        fs_utils.rimraf(output);
                        fs_utils.mkdirp(output);
                        copy_runtime.copy_runtime(output);
                        fs_utils.rimraf(dest);
                        fs_utils.mkdirp(dest + "/client");
                        if (this.bundler === 'rollup')
                            copy_runtime.copy_shimport(dest);
                        if (!!this.dev_port) return [3 /*break*/, 6];
                        _c = this;
                        return [4 /*yield*/, Deferred.find(10000)];
                    case 5:
                        _c.dev_port = _e.sent();
                        _e.label = 6;
                    case 6:
                        if (!!this.devtools_port) return [3 /*break*/, 8];
                        _d = this;
                        return [4 /*yield*/, Deferred.find(9222)];
                    case 7:
                        _d.devtools_port = _e.sent();
                        _e.label = 8;
                    case 8:
                        try {
                            manifest_data = create_manifest_data.create_manifest_data(routes, this.ext);
                            create_manifest_data.create_app({
                                bundler: this.bundler,
                                manifest_data: manifest_data,
                                dev: true,
                                dev_port: this.dev_port,
                                cwd: cwd, src: src, dest: dest, routes: routes, output: output
                            });
                        }
                        catch (err) {
                            this.emit('fatal', {
                                message: err.message
                            });
                            return [2 /*return*/];
                        }
                        this.dev_server = new DevServer(this.dev_port);
                        this.filewatchers.push(watch_dir(routes, function (_a) {
                            var file = _a.path, stats = _a.stats;
                            if (stats.isDirectory()) {
                                return path.basename(file)[0] !== '_';
                            }
                            return true;
                        }, function () {
                            try {
                                manifest_data = create_manifest_data.create_manifest_data(routes, _this.ext);
                                create_manifest_data.create_app({
                                    bundler: _this.bundler,
                                    manifest_data: manifest_data,
                                    dev: true,
                                    dev_port: _this.dev_port,
                                    cwd: cwd, src: src, dest: dest, routes: routes, output: output
                                });
                            }
                            catch (error) {
                                _this.emit('error', {
                                    type: 'manifest',
                                    error: error
                                });
                            }
                        }));
                        if (this.live) {
                            this.filewatchers.push(fs.watch(src + "/template.html", function () {
                                _this.dev_server.send({
                                    action: 'reload'
                                });
                            }));
                        }
                        deferred = new Deferred.Deferred();
                        return [4 /*yield*/, create_manifest_data.create_compilers(this.bundler, cwd, src, dest, true)];
                    case 9:
                        compilers = _e.sent();
                        emitFatal = function () {
                            _this.emit('fatal', {
                                message: "Server crashed"
                            });
                            _this.crashed = true;
                            _this.proc = null;
                        };
                        this.watch(compilers.server, {
                            name: 'server',
                            invalid: function (filename) {
                                _this.restart(filename, 'server');
                            },
                            handle_result: function (result) {
                                deferred.promise.then(function () {
                                    var restart = function () {
                                        _this.crashed = false;
                                        return Deferred.wait(_this.port)
                                            .then((function () {
                                            _this.emit('ready', {
                                                port: _this.port,
                                                process: _this.proc
                                            });
                                            if (_this.hot && _this.bundler === 'webpack') {
                                                _this.dev_server.send({
                                                    status: 'completed'
                                                });
                                            }
                                            else if (_this.live) {
                                                _this.dev_server.send({
                                                    action: 'reload'
                                                });
                                            }
                                        }))
                                            .catch(function (err) {
                                            if (_this.crashed)
                                                return;
                                            _this.emit('fatal', {
                                                message: "Server is not listening on port " + _this.port
                                            });
                                        });
                                    };
                                    var start_server = function () {
                                        // we need to give the child process its own DevTools port,
                                        // otherwise Node will try to use the parent's (and fail)
                                        var debugArgRegex = /--inspect(?:-brk|-port)?|--debug-port/;
                                        var execArgv = process.execArgv.slice();
                                        if (execArgv.some(function (arg) { return !!arg.match(debugArgRegex); })) {
                                            execArgv.push("--inspect-port=" + _this.devtools_port);
                                        }
                                        _this.proc = child_process.fork(dest + "/server/server.js", [], {
                                            cwd: process.cwd(),
                                            env: Object.assign({
                                                PORT: _this.port
                                            }, process.env),
                                            stdio: ['ipc'],
                                            execArgv: execArgv
                                        });
                                        _this.proc.stdout.on('data', function (chunk) {
                                            _this.emit('stdout', chunk);
                                        });
                                        _this.proc.stderr.on('data', function (chunk) {
                                            _this.emit('stderr', chunk);
                                        });
                                        _this.proc.on('message', function (message) {
                                            if (message.__sapper__ && message.event === 'basepath') {
                                                _this.emit('basepath', {
                                                    basepath: message.basepath
                                                });
                                            }
                                        });
                                        _this.proc.on('exit', emitFatal);
                                    };
                                    if (_this.proc) {
                                        if (_this.restarting)
                                            return;
                                        _this.restarting = true;
                                        _this.proc.removeListener('exit', emitFatal);
                                        _this.proc.kill();
                                        _this.proc.on('exit', function () { return _commonjsHelpers.__awaiter(_this, void 0, void 0, function () {
                                            return _commonjsHelpers.__generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        start_server();
                                                        return [4 /*yield*/, restart()];
                                                    case 1:
                                                        _a.sent();
                                                        this.restarting = false;
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); });
                                    }
                                    else {
                                        start_server();
                                        restart();
                                    }
                                });
                            }
                        });
                        this.watch(compilers.client, {
                            name: 'client',
                            invalid: function (filename) {
                                _this.restart(filename, 'client');
                                deferred = new Deferred.Deferred();
                                // TODO we should delete old assets. due to a webpack bug
                                // i don't even begin to comprehend, this is apparently
                                // quite difficult
                            },
                            handle_result: function (result) {
                                fs.writeFileSync(path.join(dest, 'build.json'), 
                                // TODO should be more explicit that to_json has effects
                                JSON.stringify(result.to_json(manifest_data, _this.dirs), null, '  '));
                                var client_files = result.chunks.map(function (chunk) { return "client/" + chunk.file; });
                                create_manifest_data.create_serviceworker_manifest({
                                    manifest_data: manifest_data,
                                    output: output,
                                    client_files: client_files,
                                    static_files: static_files
                                });
                                deferred.fulfil();
                                // we need to wait a beat before watching the service
                                // worker, because of some webpack nonsense
                                setTimeout(watch_serviceworker, 100);
                            }
                        });
                        watch_serviceworker = compilers.serviceworker
                            ? function () {
                                watch_serviceworker = fs_utils.noop;
                                _this.watch(compilers.serviceworker, {
                                    name: 'service worker'
                                });
                            }
                            : fs_utils.noop;
                        return [2 /*return*/];
                }
            });
        });
    };
    Watcher.prototype.close = function () {
        if (this.closed)
            return;
        this.closed = true;
        if (this.dev_server)
            this.dev_server.close();
        if (this.proc)
            this.proc.kill();
        this.filewatchers.forEach(function (watcher) {
            watcher.close();
        });
    };
    Watcher.prototype.restart = function (filename, type) {
        var _this = this;
        if (this.restarting) {
            this.current_build.changed.add(filename);
            this.current_build.rebuilding.add(type);
        }
        else {
            this.restarting = true;
            this.current_build = {
                changed: new Set([filename]),
                rebuilding: new Set([type]),
                unique_warnings: new Set(),
                unique_errors: new Set()
            };
            process.nextTick(function () {
                _this.emit('invalid', {
                    changed: Array.from(_this.current_build.changed),
                    invalid: {
                        server: _this.current_build.rebuilding.has('server'),
                        client: _this.current_build.rebuilding.has('client'),
                        serviceworker: _this.current_build.rebuilding.has('serviceworker')
                    }
                });
                _this.restarting = false;
            });
        }
    };
    Watcher.prototype.watch = function (compiler, _a) {
        var _this = this;
        var name = _a.name, _b = _a.invalid, invalid = _b === void 0 ? fs_utils.noop : _b, _c = _a.handle_result, handle_result = _c === void 0 ? fs_utils.noop : _c;
        compiler.oninvalid(invalid);
        compiler.watch(function (error, result) {
            if (error) {
                _this.emit('error', {
                    type: name,
                    error: error
                });
            }
            else {
                _this.emit('build', {
                    type: name,
                    duration: result.duration,
                    errors: result.errors,
                    warnings: result.warnings
                });
                handle_result(result);
            }
        });
    };
    return Watcher;
}(EventEmitter.EventEmitter));
var INTERVAL = 10000;
var DevServer = /** @class */ (function () {
    function DevServer(port, interval) {
        var _this = this;
        this.clients = new Set();
        this._ = http.createServer(function (req, res) {
            if (req.url !== '/__sapper__')
                return;
            req.socket.setKeepAlive(true);
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control',
                'Content-Type': 'text/event-stream;charset=utf-8',
                'Cache-Control': 'no-cache, no-transform',
                Connection: 'keep-alive',
                // While behind nginx, event stream should not be buffered:
                // http://nginx.org/docs/http/ngx_http_proxy_module.html#proxy_buffering
                'X-Accel-Buffering': 'no'
            });
            res.write('\n');
            _this.clients.add(res);
            req.on('close', function () {
                _this.clients.delete(res);
            });
        });
        this._.listen(port);
        this.interval = setInterval(function () {
            _this.send(null);
        }, INTERVAL);
    }
    DevServer.prototype.close = function () {
        this._.close();
        clearInterval(this.interval);
    };
    DevServer.prototype.send = function (data) {
        this.clients.forEach(function (client) {
            client.write("data: " + JSON.stringify(data) + "\n\n");
        });
    };
    return DevServer;
}());
function watch_dir(dir, filter, callback) {
    var watch;
    var closed = false;
    Promise.resolve().then(function () { return require('./CheapWatch.es.js'); }).then(function (_a) {
        var CheapWatch = _a.default;
        if (closed)
            return;
        watch = new CheapWatch({ dir: dir, filter: filter, debounce: 50 });
        watch.on('+', callback);
        watch.on('-', callback);
        watch.init();
    });
    return {
        close: function () {
            if (watch)
                watch.close();
            closed = true;
        }
    };
}

exports.dev = dev;
//# sourceMappingURL=dev.js.map
