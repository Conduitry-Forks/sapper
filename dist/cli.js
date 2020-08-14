'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

function _interopNamespace(e) {
	if (e && e.__esModule) { return e; } else {
		var n = {};
		if (e) {
			Object.keys(e).forEach(function (k) {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () {
						return e[k];
					}
				});
			});
		}
		n['default'] = e;
		return n;
	}
}

var _commonjsHelpers = require('./_commonjsHelpers.js');
var path = require('path');
var path__default = _interopDefault(path);
var fs = require('fs');

function toArr(any) {
	return any == null ? [] : Array.isArray(any) ? any : [any];
}

function toVal(out, key, val, opts) {
	var x, old=out[key], nxt=(
		!!~opts.string.indexOf(key) ? (val == null || val === true ? '' : String(val))
		: typeof val === 'boolean' ? val
		: !!~opts.boolean.indexOf(key) ? (val === 'false' ? false : val === 'true' || (out._.push((x = +val,x * 0 === 0) ? x : val),!!val))
		: (x = +val,x * 0 === 0) ? x : val
	);
	out[key] = old == null ? nxt : (Array.isArray(old) ? old.concat(nxt) : [old, nxt]);
}

function index (args, opts) {
	args = args || [];
	opts = opts || {};

	var k, arr, arg, name, val, out={ _:[] };
	var i=0, j=0, idx=0, len=args.length;

	const alibi = opts.alias !== void 0;
	const strict = opts.unknown !== void 0;
	const defaults = opts.default !== void 0;

	opts.alias = opts.alias || {};
	opts.string = toArr(opts.string);
	opts.boolean = toArr(opts.boolean);

	if (alibi) {
		for (k in opts.alias) {
			arr = opts.alias[k] = toArr(opts.alias[k]);
			for (i=0; i < arr.length; i++) {
				(opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
			}
		}
	}

	for (i=opts.boolean.length; i-- > 0;) {
		arr = opts.alias[opts.boolean[i]] || [];
		for (j=arr.length; j-- > 0;) opts.boolean.push(arr[j]);
	}

	for (i=opts.string.length; i-- > 0;) {
		arr = opts.alias[opts.string[i]] || [];
		for (j=arr.length; j-- > 0;) opts.string.push(arr[j]);
	}

	if (defaults) {
		for (k in opts.default) {
			name = typeof opts.default[k];
			arr = opts.alias[k] = opts.alias[k] || [];
			if (opts[name] !== void 0) {
				opts[name].push(k);
				for (i=0; i < arr.length; i++) {
					opts[name].push(arr[i]);
				}
			}
		}
	}

	const keys = strict ? Object.keys(opts.alias) : [];

	for (i=0; i < len; i++) {
		arg = args[i];

		if (arg === '--') {
			out._ = out._.concat(args.slice(++i));
			break;
		}

		for (j=0; j < arg.length; j++) {
			if (arg.charCodeAt(j) !== 45) break; // "-"
		}

		if (j === 0) {
			out._.push(arg);
		} else if (arg.substring(j, j + 3) === 'no-') {
			name = arg.substring(j + 3);
			if (strict && !~keys.indexOf(name)) {
				return opts.unknown(arg);
			}
			out[name] = false;
		} else {
			for (idx=j+1; idx < arg.length; idx++) {
				if (arg.charCodeAt(idx) === 61) break; // "="
			}

			name = arg.substring(j, idx);
			val = arg.substring(++idx) || (i+1 === len || (''+args[i+1]).charCodeAt(0) === 45 || args[++i]);
			arr = (j === 2 ? [name] : name);

			for (idx=0; idx < arr.length; idx++) {
				name = arr[idx];
				if (strict && !~keys.indexOf(name)) return opts.unknown('-'.repeat(j) + name);
				toVal(out, name, (idx + 1 < arr.length) || val, opts);
			}
		}
	}

	if (defaults) {
		for (k in opts.default) {
			if (out[k] === void 0) {
				out[k] = opts.default[k];
			}
		}
	}

	if (alibi) {
		for (k in out) {
			arr = opts.alias[k] || [];
			while (arr.length > 0) {
				out[arr.shift()] = out[k];
			}
		}
	}

	return out;
}

var lib = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': index
});

const GAP = 4;
const __ = '  ';
const ALL = '__all__';
const DEF = '__default__';
const NL = '\n';

function format(arr) {
	if (!arr.length) return '';
	let len = maxLen( arr.map(x => x[0]) ) + GAP;
	let join = a => a[0] + ' '.repeat(len - a[0].length) + a[1] + (a[2] == null ? '' : `  (default ${a[2]})`);
	return arr.map(join);
}

function maxLen(arr) {
  let c=0, d=0, l=0, i=arr.length;
  if (i) while (i--) {
    d = arr[i].length;
    if (d > c) {
      l = i; c = d;
    }
  }
  return arr[l].length;
}

function noop(s) {
	return s;
}

function section(str, arr, fn) {
	if (!arr || !arr.length) return '';
	let i=0, out='';
	out += (NL + __ + str);
	for (; i < arr.length; i++) {
		out += (NL + __ + __ + fn(arr[i]));
	}
	return out + NL;
}

var help = function (bin, tree, key, single) {
	let out='', cmd=tree[key], pfx=`$ ${bin}`, all=tree[ALL];
	let prefix = s => `${pfx} ${s}`.replace(/\s+/g, ' ');

	// update ALL & CMD options
	let tail = [['-h, --help', 'Displays this message']];
	if (key === DEF) tail.unshift(['-v, --version', 'Displays current version']);
	cmd.options = (cmd.options || []).concat(all.options, tail);

	// write options placeholder
	if (cmd.options.length > 0) cmd.usage += ' [options]';

	// description ~> text only; usage ~> prefixed
	out += section('Description', cmd.describe, noop);
	out += section('Usage', [cmd.usage], prefix);

	if (!single && key === DEF) {
		// General help :: print all non-internal commands & their 1st line of text
		let cmds = Object.keys(tree).filter(k => !/__/.test(k));
		let text = cmds.map(k => [k, (tree[k].describe || [''])[0]]);
		out += section('Available Commands', format(text), noop);

		out += (NL + __ + 'For more info, run any command with the `--help` flag');
		cmds.slice(0, 2).forEach(k => {
			out += (NL + __ + __ + `${pfx} ${k} --help`);
		});
		out += NL;
	} else if (!single && key !== DEF) {
		// Command help :: print its aliases if any
		out += section('Aliases', cmd.alibi, prefix);
	}

	out += section('Options', format(cmd.options), noop);
	out += section('Examples', cmd.examples.map(prefix), noop);

	return out;
};

var error = function (bin, str, num=1) {
	let out = section('ERROR', [str], noop);
	out += (NL + __ + `Run \`$ ${bin} --help\` for more info.` + NL);
	console.error(out);
	process.exit(num);
};

// Strips leading `-|--` & extra space(s)
var parse = function (str) {
	return (str || '').split(/^-{1,2}|,|\s+-{1,2}|\s+/).filter(Boolean);
};

// @see https://stackoverflow.com/a/18914855/3577474
var sentences = function (str) {
	return (str || '').replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|');
};

var utils = {
	help: help,
	error: error,
	parse: parse,
	sentences: sentences
};

var mri = _commonjsHelpers.getCjsExportFromNamespace(lib);

const ALL$1 = '__all__';
const DEF$1 = '__default__';

class Sade {
	constructor(name, isOne) {
		let [bin, ...rest] = name.split(/\s+/);
		isOne = isOne || rest.length > 0;

		this.bin = bin;
		this.ver = '0.0.0';
		this.default = '';
		this.tree = {};
		// set internal shapes;
		this.command(ALL$1);
		this.command([DEF$1].concat(isOne ? rest : '<command>').join(' '));
		this.single = isOne;
		this.curr = ''; // reset
	}

	command(str, desc, opts={}) {
		if (this.single) {
			throw new Error('Disable "single" mode to add commands');
		}

		// All non-([|<) are commands
		let cmd=[], usage=[], rgx=/(\[|<)/;
		str.split(/\s+/).forEach(x => {
			(rgx.test(x.charAt(0)) ? usage : cmd).push(x);
		});

		// Back to string~!
		cmd = cmd.join(' ');

		if (cmd in this.tree) {
			throw new Error(`Command already exists: ${cmd}`);
		}

		// re-include `cmd` for commands
		cmd.includes('__') || usage.unshift(cmd);
		usage = usage.join(' '); // to string

		this.curr = cmd;
		if (opts.default) this.default=cmd;

		this.tree[cmd] = { usage, alibi:[], options:[], alias:{}, default:{}, examples:[] };
		if (opts.alias) this.alias(opts.alias);
		if (desc) this.describe(desc);

		return this;
	}

	describe(str) {
		this.tree[this.curr || DEF$1].describe = Array.isArray(str) ? str : utils.sentences(str);
		return this;
	}

	alias(...names) {
		if (this.single) throw new Error('Cannot call `alias()` in "single" mode');
		if (!this.curr) throw new Error('Cannot call `alias()` before defining a command');
		this.tree[this.curr].alibi = this.tree[this.curr].alibi.concat(...names);
		return this;
	}

	option(str, desc, val) {
		let cmd = this.tree[ this.curr || ALL$1 ];

		let [flag, alias] = utils.parse(str);
		if (alias && alias.length > 1) [flag, alias]=[alias, flag];

		str = `--${flag}`;
		if (alias && alias.length > 0) {
			str = `-${alias}, ${str}`;
			let old = cmd.alias[alias];
			cmd.alias[alias] = (old || []).concat(flag);
		}

		let arr = [str, desc || ''];

		if (val !== void 0) {
			arr.push(val);
			cmd.default[flag] = val;
		} else if (!alias) {
			cmd.default[flag] = void 0;
		}

		cmd.options.push(arr);
		return this;
	}

	action(handler) {
		this.tree[ this.curr || DEF$1 ].handler = handler;
		return this;
	}

	example(str) {
		this.tree[ this.curr || DEF$1 ].examples.push(str);
		return this;
	}

	version(str) {
		this.ver = str;
		return this;
	}

	parse(arr, opts={}) {
		arr = arr.slice(); // copy
		let offset=2, tmp, idx, isVoid, cmd;
		let alias = { h:'help', v:'version' };
		let argv = mri(arr.slice(offset), { alias });
		let isSingle = this.single;
		let bin = this.bin;
		let name = '';

		if (isSingle) {
			cmd = this.tree[DEF$1];
		} else {
			// Loop thru possible command(s)
			let k, i=1, len=argv._.length + 1;
			for (; i < len; i++) {
				tmp = argv._.slice(0, i).join(' ');
				if (this.tree[tmp] !== void 0) {
					name=tmp; idx=arr.indexOf(tmp, 1);
				} else {
					for (k in this.tree) {
						if (this.tree[k].alibi.includes(tmp)) {
							idx = arr.indexOf(tmp);
							arr.splice(idx, 1, ...k.split(' '));
							name = k;
							break;
						}
					}
				}
			}

			cmd = this.tree[name];
			isVoid = (cmd === void 0);

			if (isVoid) {
				if (this.default) {
					name = this.default;
					cmd = this.tree[name];
					arr.unshift(name);
					offset++;
				} else if (tmp) {
					return utils.error(bin, `Invalid command: ${tmp}`);
				} //=> else: cmd not specified, wait for now...
			}
		}

		// show main help if relied on "default" for multi-cmd
		if (argv.help) return this.help(!isSingle && !isVoid && name);
		if (argv.version) return this._version();

		if (!isSingle && cmd === void 0) {
			return utils.error(bin, 'No command specified.');
		}

		let all = this.tree[ALL$1];
		// merge all objects :: params > command > all
		opts.alias = Object.assign(all.alias, cmd.alias, opts.alias);
		opts.default = Object.assign(all.default, cmd.default, opts.default);

		tmp = name.split(' ');
		idx = arr.indexOf(tmp[0], 2);
		if (!!~idx) arr.splice(idx, tmp.length);

		let vals = mri(arr.slice(offset), opts);
		if (!vals || typeof vals === 'string') {
			return utils.error(bin, vals || 'Parsed unknown option flag(s)!');
		}

		let segs = cmd.usage.split(/\s+/);
		let reqs = segs.filter(x => x.charAt(0)==='<');
		let args = vals._.splice(0, reqs.length);

		if (args.length < reqs.length) {
			if (name) bin += ` ${name}`; // for help text
			return utils.error(bin, 'Insufficient arguments!');
		}

		segs.filter(x => x.charAt(0)==='[').forEach(_ => {
			args.push(vals._.shift()); // adds `undefined` per [slot] if no more
		});

		args.push(vals); // flags & co are last
		let handler = cmd.handler;
		return opts.lazy ? { args, name, handler } : handler.apply(null, args);
	}

	help(str) {
		console.log(
			utils.help(this.bin, this.tree, str || DEF$1, this.single)
		);
	}

	_version() {
		console.log(`${this.bin}, ${this.ver}`);
	}
}

var lib$1 = (str, isOne) => new Sade(str, isOne);

var version = "0.28.0";

var prog = lib$1('sapper').version(version);
if (process.argv[2] === 'start') {
    // remove this in a future version
    console.error(_commonjsHelpers.$.bold().red("'sapper start' has been removed"));
    console.error("Use 'node [build_dir]' instead");
    process.exit(1);
}
var start = Date.now();
prog.command('dev')
    .describe('Start a development server')
    .option('-p, --port', 'Specify a port')
    .option('-o, --open', 'Open a browser window')
    .option('--dev-port', 'Specify a port for development server')
    .option('--hot', 'Use hot module replacement (requires webpack)', true)
    .option('--live', 'Reload on changes if not using --hot', true)
    .option('--bundler', 'Specify a bundler (rollup or webpack)')
    .option('--cwd', 'Current working directory', '.')
    .option('--src', 'Source directory', 'src')
    .option('--routes', 'Routes directory', 'src/routes')
    .option('--static', 'Static files directory', 'static')
    .option('--output', 'Sapper intermediate file output directory', 'src/node_modules/@sapper')
    .option('--build-dir', 'Development build directory', '__sapper__/dev')
    .option('--ext', 'Custom Route Extension', '.svelte .html')
    .action(function (opts) { return _commonjsHelpers.__awaiter(void 0, void 0, void 0, function () {
    var dev, watcher, first_1;
    return _commonjsHelpers.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./dev.js'); })];
            case 1:
                dev = (_a.sent()).dev;
                try {
                    watcher = dev({
                        cwd: opts.cwd,
                        src: opts.src,
                        routes: opts.routes,
                        static: opts.static,
                        output: opts.output,
                        dest: opts['build-dir'],
                        port: opts.port,
                        'dev-port': opts['dev-port'],
                        live: opts.live,
                        hot: opts.hot,
                        bundler: opts.bundler,
                        ext: opts.ext
                    });
                    first_1 = true;
                    watcher.on('stdout', function (data) {
                        process.stdout.write(data);
                    });
                    watcher.on('stderr', function (data) {
                        process.stderr.write(data);
                    });
                    watcher.on('ready', function (event) { return _commonjsHelpers.__awaiter(void 0, void 0, void 0, function () {
                        var exec;
                        return _commonjsHelpers.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!first_1) return [3 /*break*/, 3];
                                    console.log(_commonjsHelpers.$.bold().cyan("> Listening on http://localhost:" + event.port));
                                    if (!opts.open) return [3 /*break*/, 2];
                                    return [4 /*yield*/, Promise.resolve().then(function () { return _interopNamespace(require('child_process')); })];
                                case 1:
                                    exec = (_a.sent()).exec;
                                    exec("open http://localhost:" + event.port);
                                    _a.label = 2;
                                case 2:
                                    first_1 = false;
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    watcher.on('invalid', function (event) {
                        var changed = event.changed.map(function (filename) { return path.relative(process.cwd(), filename); }).join(', ');
                        console.log("\n" + _commonjsHelpers.$.bold().cyan(changed) + " changed. rebuilding...");
                    });
                    watcher.on('error', function (event) {
                        var type = event.type, error = event.error;
                        console.log(_commonjsHelpers.$.bold().red("\u2717 " + type));
                        if (error.loc && error.loc.file) {
                            console.log(_commonjsHelpers.$.bold(path.relative(process.cwd(), error.loc.file) + " (" + error.loc.line + ":" + error.loc.column + ")"));
                        }
                        console.log(_commonjsHelpers.$.red(event.error.message));
                        if (error.frame)
                            console.log(error.frame);
                    });
                    watcher.on('fatal', function (event) {
                        console.log(_commonjsHelpers.$.bold().red("> " + event.message));
                        if (event.log)
                            console.log(event.log);
                    });
                    watcher.on('build', function (event) {
                        if (event.errors.length) {
                            console.log(_commonjsHelpers.$.bold().red("\u2717 " + event.type));
                            event.errors.filter(function (e) { return !e.duplicate; }).forEach(function (error) {
                                if (error.file)
                                    console.log(_commonjsHelpers.$.bold(error.file));
                                console.log(error.message);
                            });
                            var hidden = event.errors.filter(function (e) { return e.duplicate; }).length;
                            if (hidden > 0) {
                                console.log(hidden + " duplicate " + (hidden === 1 ? 'error' : 'errors') + " hidden\n");
                            }
                        }
                        else if (event.warnings.length) {
                            console.log(_commonjsHelpers.$.bold().yellow("\u2022 " + event.type));
                            event.warnings.filter(function (e) { return !e.duplicate; }).forEach(function (warning) {
                                if (warning.file)
                                    console.log(_commonjsHelpers.$.bold(warning.file));
                                console.log(warning.message);
                            });
                            var hidden = event.warnings.filter(function (e) { return e.duplicate; }).length;
                            if (hidden > 0) {
                                console.log(hidden + " duplicate " + (hidden === 1 ? 'warning' : 'warnings') + " hidden\n");
                            }
                        }
                        else {
                            console.log(_commonjsHelpers.$.bold().green("\u2714 " + event.type) + " " + _commonjsHelpers.$.gray("(" + _commonjsHelpers.format_milliseconds(event.duration) + ")"));
                        }
                    });
                }
                catch (err) {
                    console.log(_commonjsHelpers.$.bold().red("> " + err.message));
                    console.log(_commonjsHelpers.$.gray(err.stack));
                    process.exit(1);
                }
                return [2 /*return*/];
        }
    });
}); });
prog.command('build [dest]')
    .describe('Create a production-ready version of your app')
    .option('-p, --port', 'Default of process.env.PORT', '3000')
    .option('--bundler', 'Specify a bundler (rollup or webpack, blank for auto)')
    .option('--legacy', 'Create separate legacy build')
    .option('--cwd', 'Current working directory', '.')
    .option('--src', 'Source directory', 'src')
    .option('--routes', 'Routes directory', 'src/routes')
    .option('--output', 'Sapper intermediate file output directory', 'src/node_modules/@sapper')
    .option('--ext', 'Custom page route extensions (space separated)', '.svelte .html')
    .example("build custom-dir -p 4567")
    .action(function (dest, opts) {
    if (dest === void 0) { dest = '__sapper__/build'; }
    return _commonjsHelpers.__awaiter(void 0, void 0, void 0, function () {
        var launcher, err_1;
        return _commonjsHelpers.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("> Building...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, _build(opts.bundler, opts.legacy, opts.cwd, opts.src, opts.routes, opts.output, dest, opts.ext)];
                case 2:
                    _a.sent();
                    launcher = path.resolve(dest, 'index.js');
                    fs.writeFileSync(launcher, ("\n\t\t\t\t// generated by sapper build at " + new Date().toISOString() + "\n\t\t\t\tprocess.env.NODE_ENV = process.env.NODE_ENV || 'production';\n\t\t\t\tprocess.env.PORT = process.env.PORT || " + (opts.port || 3000) + ";\n\n\t\t\t\tconsole.log('Starting server on port ' + process.env.PORT);\n\t\t\t\trequire('./server/server.js');\n\t\t\t").replace(/^\t+/gm, '').trim());
                    console.error("\n> Finished in " + _commonjsHelpers.elapsed(start) + ". Type " + _commonjsHelpers.$.bold().cyan("node " + dest) + " to run the app.");
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.log("" + _commonjsHelpers.$.bold().red("> " + err_1.message));
                    console.log(_commonjsHelpers.$.gray(err_1.stack));
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
});
prog.command('export [dest]')
    .describe('Export your app as static files (if possible)')
    .option('--build', '(Re)build app before exporting', true)
    .option('--basepath', 'Specify a base path')
    .option('--host', 'Host header to use when crawling site')
    .option('--concurrent', 'Concurrent requests', 8)
    .option('--timeout', 'Milliseconds to wait for a page (--no-timeout to disable)', 5000)
    .option('--legacy', 'Creates an additional build, served only to legacy browsers')
    .option('--bundler', 'Specify a bundler (rollup or webpack, blank for auto)')
    .option('--cwd', 'Current working directory', '.')
    .option('--src', 'Source directory', 'src')
    .option('--routes', 'Routes directory', 'src/routes')
    .option('--static', 'Static files directory', 'static')
    .option('--output', 'Sapper intermediate file output directory', 'src/node_modules/@sapper')
    .option('--build-dir', 'Intermediate build directory', '__sapper__/build')
    .option('--ext', 'Custom page route extensions (space separated)', '.svelte .html')
    .option('--entry', 'Custom entry points (space separated)', '/')
    .action(function (dest, opts) {
    if (dest === void 0) { dest = '__sapper__/export'; }
    return _commonjsHelpers.__awaiter(void 0, void 0, void 0, function () {
        var _export, pb_1, err_2;
        return _commonjsHelpers.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!opts.build) return [3 /*break*/, 2];
                    console.log("> Building...");
                    return [4 /*yield*/, _build(opts.bundler, opts.legacy, opts.cwd, opts.src, opts.routes, opts.output, opts['build-dir'], opts.ext)];
                case 1:
                    _a.sent();
                    console.error("\n> Built in " + _commonjsHelpers.elapsed(start));
                    _a.label = 2;
                case 2: return [4 /*yield*/, Promise.resolve().then(function () { return require('./export.js'); })];
                case 3:
                    _export = (_a.sent()).export;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./index.js'); }).then(function (n) { return n.index; })];
                case 4:
                    pb_1 = (_a.sent()).default;
                    return [4 /*yield*/, _export({
                            cwd: opts.cwd,
                            static: opts.static,
                            build_dir: opts['build-dir'],
                            export_dir: dest,
                            basepath: opts.basepath,
                            host_header: opts.host,
                            timeout: opts.timeout,
                            concurrent: opts.concurrent,
                            entry: opts.entry,
                            oninfo: function (event) {
                                console.log(_commonjsHelpers.$.bold().cyan("> " + event.message));
                            },
                            onfile: function (event) {
                                var size_color = event.size > 150000 ? _commonjsHelpers.$.bold().red : event.size > 50000 ? _commonjsHelpers.$.bold().yellow : _commonjsHelpers.$.bold().gray;
                                var size_label = size_color(_commonjsHelpers.left_pad(pb_1(event.size), 10));
                                var file_label = event.status === 200
                                    ? event.file
                                    : _commonjsHelpers.$.bold()[event.status >= 400 ? 'red' : 'yellow']("(" + event.status + ") " + event.file);
                                console.log(size_label + "   " + file_label);
                            }
                        })];
                case 5:
                    _a.sent();
                    console.error("\n> Finished in " + _commonjsHelpers.elapsed(start) + ". Type " + _commonjsHelpers.$.bold().cyan("npx serve " + dest) + " to run the app.");
                    return [3 /*break*/, 7];
                case 6:
                    err_2 = _a.sent();
                    console.error(_commonjsHelpers.$.bold().red("> " + err_2.message));
                    process.exit(1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
});
prog.parse(process.argv, { unknown: function (arg) { return "Unknown option: " + arg; } });
function _build(bundler, legacy, cwd, src, routes, output, dest, ext) {
    return _commonjsHelpers.__awaiter(this, void 0, void 0, function () {
        var build;
        return _commonjsHelpers.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./build.js'); })];
                case 1:
                    build = (_a.sent()).build;
                    return [4 /*yield*/, build({
                            bundler: bundler,
                            legacy: legacy,
                            cwd: cwd,
                            src: src,
                            routes: routes,
                            dest: dest,
                            ext: ext,
                            output: output,
                            oncompile: function (event) {
                                var banner = "built " + event.type;
                                var c = function (txt) { return _commonjsHelpers.$.cyan(txt); };
                                var warnings = event.result.warnings;
                                if (warnings.length > 0) {
                                    banner += " with " + warnings.length + " " + (warnings.length === 1 ? 'warning' : 'warnings');
                                    c = function (txt) { return _commonjsHelpers.$.cyan(txt); };
                                }
                                console.log();
                                console.log(c("\u250C\u2500" + _commonjsHelpers.repeat('─', banner.length) + "\u2500\u2510"));
                                console.log(c("\u2502 " + _commonjsHelpers.$.bold(banner) + " \u2502"));
                                console.log(c("\u2514\u2500" + _commonjsHelpers.repeat('─', banner.length) + "\u2500\u2518"));
                                console.log(event.result.print());
                            }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=cli.js.map
