import { getContext } from 'svelte';
import { CONTEXT_KEY } from './internal/shared';
import { writable } from 'svelte/store';
import App from './internal/App.svelte';
import { ignore, routes, components, root_comp, ErrorComponent } from './internal/manifest-client';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function goto(href, opts) {
    if (opts === void 0) { opts = { noscroll: false, replaceState: false }; }
    var target = select_target(new URL(href, document.baseURI));
    if (target) {
        _history[opts.replaceState ? 'replaceState' : 'pushState']({ id: cid }, '', href);
        return navigate(target, null, opts.noscroll).then(function () { });
    }
    location.href = href;
    return new Promise(function (f) { }); // never resolves
}

function page_store(value) {
    var store = writable(value);
    var ready = true;
    function notify() {
        ready = true;
        store.update(function (val) { return val; });
    }
    function set(new_value) {
        ready = false;
        store.set(new_value);
    }
    function subscribe(run) {
        var old_value;
        return store.subscribe(function (value) {
            if (old_value === undefined || (ready && value !== old_value)) {
                run(old_value = value);
            }
        });
    }
    return { notify: notify, set: set, subscribe: subscribe };
}

var initial_data = typeof __SAPPER__ !== 'undefined' && __SAPPER__;
var ready = false;
var root_component;
var current_token;
var root_preloaded;
var current_branch = [];
var current_query = '{}';
var stores = {
    page: page_store({}),
    preloading: writable(null),
    session: writable(initial_data && initial_data.session)
};
var $session;
var session_dirty;
stores.session.subscribe(function (value) { return __awaiter(void 0, void 0, void 0, function () {
    var target, token, _a, redirect, props, branch;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                $session = value;
                if (!ready)
                    return [2 /*return*/];
                session_dirty = true;
                target = select_target(new URL(location.href));
                token = current_token = {};
                return [4 /*yield*/, hydrate_target(target)];
            case 1:
                _a = _b.sent(), redirect = _a.redirect, props = _a.props, branch = _a.branch;
                if (token !== current_token)
                    return [2 /*return*/]; // a secondary navigation happened while we were loading
                if (!redirect) return [3 /*break*/, 3];
                return [4 /*yield*/, goto(redirect.location, { replaceState: true })];
            case 2:
                _b.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, render(branch, props, target.page)];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); });
var prefetching = null;
function set_prefetching(href, promise) {
    prefetching = { href: href, promise: promise };
}
var target;
function set_target(element) {
    target = element;
}
var uid = 1;
function set_uid(n) {
    uid = n;
}
var cid;
function set_cid(n) {
    cid = n;
}
var _history = typeof history !== 'undefined' ? history : {
    pushState: function (state, title, href) { },
    replaceState: function (state, title, href) { },
    scrollRestoration: ''
};
var scroll_history = {};
function extract_query(search) {
    var query = Object.create(null);
    if (search.length > 0) {
        search.slice(1).split('&').forEach(function (searchParam) {
            var _a = /([^=]*)(?:=(.*))?/.exec(decodeURIComponent(searchParam.replace(/\+/g, ' '))), key = _a[1], _b = _a[2], value = _b === void 0 ? '' : _b;
            if (typeof query[key] === 'string')
                query[key] = [query[key]];
            if (typeof query[key] === 'object')
                query[key].push(value);
            else
                query[key] = value;
        });
    }
    return query;
}
function select_target(url) {
    if (url.origin !== location.origin)
        return null;
    if (!url.pathname.startsWith(initial_data.baseUrl))
        return null;
    var path = url.pathname.slice(initial_data.baseUrl.length);
    if (path === '') {
        path = '/';
    }
    // avoid accidental clashes between server routes and page routes
    if (ignore.some(function (pattern) { return pattern.test(path); }))
        return;
    for (var i = 0; i < routes.length; i += 1) {
        var route = routes[i];
        var match = route.pattern.exec(path);
        if (match) {
            var query = extract_query(url.search);
            var part = route.parts[route.parts.length - 1];
            var params = part.params ? part.params(match) : {};
            var page = { host: location.host, path: path, query: query, params: params };
            return { href: url.href, route: route, match: match, page: page };
        }
    }
}
function handle_error(url) {
    var host = location.host, pathname = location.pathname, search = location.search;
    var session = initial_data.session, preloaded = initial_data.preloaded, status = initial_data.status, error = initial_data.error;
    if (!root_preloaded) {
        root_preloaded = preloaded && preloaded[0];
    }
    var props = {
        error: error,
        status: status,
        session: session,
        level0: {
            props: root_preloaded
        },
        level1: {
            props: {
                status: status,
                error: error
            },
            component: ErrorComponent
        },
        segments: preloaded
    };
    var query = extract_query(search);
    render([], props, { host: host, path: pathname, query: query, params: {} });
}
function scroll_state() {
    return {
        x: pageXOffset,
        y: pageYOffset
    };
}
function navigate(target, id, noscroll, hash) {
    return __awaiter(this, void 0, void 0, function () {
        var current_scroll, loaded, token, loaded_result, redirect, props, branch, scroll_1, deep_linked;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (id) {
                        // popstate or initial navigation
                        cid = id;
                    }
                    else {
                        current_scroll = scroll_state();
                        // clicked on a link. preserve scroll state
                        scroll_history[cid] = current_scroll;
                        id = cid = ++uid;
                        scroll_history[cid] = noscroll ? current_scroll : { x: 0, y: 0 };
                    }
                    cid = id;
                    if (root_component)
                        stores.preloading.set(true);
                    loaded = prefetching && prefetching.href === target.href ?
                        prefetching.promise :
                        hydrate_target(target);
                    prefetching = null;
                    token = current_token = {};
                    return [4 /*yield*/, loaded];
                case 1:
                    loaded_result = _a.sent();
                    redirect = loaded_result.redirect;
                    if (token !== current_token)
                        return [2 /*return*/]; // a secondary navigation happened while we were loading
                    if (!redirect) return [3 /*break*/, 3];
                    return [4 /*yield*/, goto(redirect.location, { replaceState: true })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    props = loaded_result.props, branch = loaded_result.branch;
                    return [4 /*yield*/, render(branch, props, target.page)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (document.activeElement && (document.activeElement instanceof HTMLElement))
                        document.activeElement.blur();
                    if (!noscroll) {
                        scroll_1 = scroll_history[id];
                        if (hash) {
                            deep_linked = document.getElementById(hash.slice(1));
                            if (deep_linked) {
                                scroll_1 = {
                                    x: 0,
                                    y: deep_linked.getBoundingClientRect().top + scrollY
                                };
                            }
                        }
                        scroll_history[cid] = scroll_1;
                        if (scroll_1)
                            scrollTo(scroll_1.x, scroll_1.y);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function render(branch, props, page) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    stores.page.set(page);
                    stores.preloading.set(false);
                    if (!root_component) return [3 /*break*/, 1];
                    root_component.$set(props);
                    return [3 /*break*/, 3];
                case 1:
                    props.stores = {
                        page: { subscribe: stores.page.subscribe },
                        preloading: { subscribe: stores.preloading.subscribe },
                        session: stores.session
                    };
                    _a = props;
                    _b = {};
                    return [4 /*yield*/, root_preloaded];
                case 2:
                    _a.level0 = (_b.props = _c.sent(),
                        _b);
                    props.notify = stores.page.notify;
                    root_component = new App({
                        target: target,
                        props: props,
                        hydrate: true
                    });
                    _c.label = 3;
                case 3:
                    current_branch = branch;
                    current_query = JSON.stringify(page.query);
                    ready = true;
                    session_dirty = false;
                    return [2 /*return*/];
            }
        });
    });
}
function part_changed(i, segment, match, stringified_query) {
    // TODO only check query string changes for preload functions
    // that do in fact depend on it (using static analysis or
    // runtime instrumentation)
    if (stringified_query !== current_query)
        return true;
    var previous = current_branch[i];
    if (!previous)
        return false;
    if (segment !== previous.segment)
        return true;
    if (previous.match) {
        if (JSON.stringify(previous.match.slice(1, i + 2)) !== JSON.stringify(match.slice(1, i + 2))) {
            return true;
        }
    }
}
function hydrate_target(target) {
    return __awaiter(this, void 0, void 0, function () {
        var route, page, segments, redirect, props, preload_context, root_preload, branch, l, stringified_query_1, match_1, segment_dirty_1, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    route = target.route, page = target.page;
                    segments = page.path.split('/').filter(Boolean);
                    redirect = null;
                    props = { error: null, status: 200, segments: [segments[0]] };
                    preload_context = {
                        fetch: function (url, opts) { return fetch(url, opts); },
                        redirect: function (statusCode, location) {
                            if (redirect && (redirect.statusCode !== statusCode || redirect.location !== location)) {
                                throw new Error("Conflicting redirects");
                            }
                            redirect = { statusCode: statusCode, location: location };
                        },
                        error: function (status, error) {
                            props.error = typeof error === 'string' ? new Error(error) : error;
                            props.status = status;
                        }
                    };
                    if (!root_preloaded) {
                        root_preload = root_comp.preload || (function () { });
                        root_preloaded = initial_data.preloaded[0] || root_preload.call(preload_context, {
                            host: page.host,
                            path: page.path,
                            query: page.query,
                            params: {}
                        }, $session);
                    }
                    l = 1;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    stringified_query_1 = JSON.stringify(page.query);
                    match_1 = route.pattern.exec(page.path);
                    segment_dirty_1 = false;
                    return [4 /*yield*/, Promise.all(route.parts.map(function (part, i) { return __awaiter(_this, void 0, void 0, function () {
                            var segment, j, _a, component, preload, preloaded, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        segment = segments[i];
                                        if (part_changed(i, segment, match_1, stringified_query_1))
                                            segment_dirty_1 = true;
                                        props.segments[l] = segments[i + 1]; // TODO make this less confusing
                                        if (!part)
                                            return [2 /*return*/, { segment: segment }];
                                        j = l++;
                                        if (!session_dirty && !segment_dirty_1 && current_branch[i] && current_branch[i].part === part.i) {
                                            return [2 /*return*/, current_branch[i]];
                                        }
                                        segment_dirty_1 = false;
                                        return [4 /*yield*/, load_component(components[part.i])];
                                    case 1:
                                        _a = _c.sent(), component = _a.default, preload = _a.preload;
                                        if (!(ready || !initial_data.preloaded[i + 1])) return [3 /*break*/, 5];
                                        if (!preload) return [3 /*break*/, 3];
                                        return [4 /*yield*/, preload.call(preload_context, {
                                                host: page.host,
                                                path: page.path,
                                                query: page.query,
                                                params: part.params ? part.params(target.match) : {}
                                            }, $session)];
                                    case 2:
                                        _b = _c.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _b = {};
                                        _c.label = 4;
                                    case 4:
                                        preloaded = _b;
                                        return [3 /*break*/, 6];
                                    case 5:
                                        preloaded = initial_data.preloaded[i + 1];
                                        _c.label = 6;
                                    case 6: return [2 /*return*/, (props["level" + j] = { component: component, props: preloaded, segment: segment, match: match_1, part: part.i })];
                                }
                            });
                        }); }))];
                case 2:
                    branch = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    props.error = error_1;
                    props.status = 500;
                    branch = [];
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, { redirect: redirect, props: props, branch: branch }];
            }
        });
    });
}
function load_css(chunk) {
    var href = "client/" + chunk;
    if (document.querySelector("link[href=\"" + href + "\"]"))
        return;
    return new Promise(function (fulfil, reject) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = function () { return fulfil(); };
        link.onerror = reject;
        document.head.appendChild(link);
    });
}
function load_component(component) {
    // TODO this is temporary — once placeholders are
    // always rewritten, scratch the ternary
    var promises = (typeof component.css === 'string' ? [] : component.css.map(load_css));
    promises.unshift(component.js());
    return Promise.all(promises).then(function (values) { return values[0]; });
}

function prefetch(href) {
    var target = select_target(new URL(href, document.baseURI));
    if (target) {
        if (!prefetching || href !== prefetching.href) {
            set_prefetching(href, hydrate_target(target));
        }
        return prefetching.promise;
    }
}

function start(opts) {
    if ('scrollRestoration' in _history) {
        _history.scrollRestoration = 'manual';
    }
    // Adopted from Nuxt.js
    // Reset scrollRestoration to auto when leaving page, allowing page reload
    // and back-navigation from other pages to use the browser to restore the
    // scrolling position.
    addEventListener('beforeunload', function () {
        _history.scrollRestoration = 'auto';
    });
    // Setting scrollRestoration to manual again when returning to this page.
    addEventListener('load', function () {
        _history.scrollRestoration = 'manual';
    });
    set_target(opts.target);
    addEventListener('click', handle_click);
    addEventListener('popstate', handle_popstate);
    // prefetch
    addEventListener('touchstart', trigger_prefetch);
    addEventListener('mousemove', handle_mousemove);
    return Promise.resolve().then(function () {
        var hash = location.hash, href = location.href;
        _history.replaceState({ id: uid }, '', href);
        var url = new URL(location.href);
        if (initial_data.error)
            return handle_error();
        var target = select_target(url);
        if (target)
            return navigate(target, uid, true, hash);
    });
}
var mousemove_timeout;
function handle_mousemove(event) {
    clearTimeout(mousemove_timeout);
    mousemove_timeout = setTimeout(function () {
        trigger_prefetch(event);
    }, 20);
}
function trigger_prefetch(event) {
    var a = find_anchor(event.target);
    if (!a || a.rel !== 'prefetch')
        return;
    prefetch(a.href);
}
function handle_click(event) {
    // Adapted from https://github.com/visionmedia/page.js
    // MIT license https://github.com/visionmedia/page.js#license
    if (which(event) !== 1)
        return;
    if (event.metaKey || event.ctrlKey || event.shiftKey)
        return;
    if (event.defaultPrevented)
        return;
    var a = find_anchor(event.target);
    if (!a)
        return;
    if (!a.href)
        return;
    // check if link is inside an svg
    // in this case, both href and target are always inside an object
    var svg = typeof a.href === 'object' && a.href.constructor.name === 'SVGAnimatedString';
    var href = String(svg ? a.href.baseVal : a.href);
    if (href === location.href) {
        if (!location.hash)
            event.preventDefault();
        return;
    }
    // Ignore if tag has
    // 1. 'download' attribute
    // 2. rel='external' attribute
    if (a.hasAttribute('download') || a.getAttribute('rel') === 'external')
        return;
    // Ignore if <a> has a target
    if (svg ? a.target.baseVal : a.target)
        return;
    var url = new URL(href);
    // Don't handle hash changes
    if (url.pathname === location.pathname && url.search === location.search)
        return;
    var target = select_target(url);
    if (target) {
        var noscroll = a.hasAttribute('sapper:noscroll');
        navigate(target, null, noscroll, url.hash);
        event.preventDefault();
        _history.pushState({ id: cid }, '', url.href);
    }
}
function which(event) {
    return event.which === null ? event.button : event.which;
}
function find_anchor(node) {
    while (node && node.nodeName.toUpperCase() !== 'A')
        node = node.parentNode; // SVG <a> elements have a lowercase name
    return node;
}
function handle_popstate(event) {
    scroll_history[cid] = scroll_state();
    if (event.state) {
        var url = new URL(location.href);
        var target = select_target(url);
        if (target) {
            navigate(target, event.state.id);
        }
        else {
            location.href = location.href; // eslint-disable-line
        }
    }
    else {
        // hashchange
        set_uid(uid + 1);
        set_cid(uid);
        _history.replaceState({ id: cid }, '', location.href);
    }
}

function prefetchRoutes(pathnames) {
    return routes
        .filter(pathnames
        ? function (route) { return pathnames.some(function (pathname) { return route.pattern.test(pathname); }); }
        : function () { return true; })
        .reduce(function (promise, route) { return promise.then(function () {
        return Promise.all(route.parts.map(function (part) { return part && load_component(components[part.i]); }));
    }); }, Promise.resolve());
}

var stores$1 = function () { return getContext(CONTEXT_KEY); };

export { goto, prefetch, prefetchRoutes, start, stores$1 as stores };
