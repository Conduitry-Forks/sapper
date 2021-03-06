const path = require('path');

module.exports = function create_matchers(files) {
	return files
		.map(file => {
			const parts = file.replace(/\.(html|js|mjs)$/, '').split(path.sep);
			if (parts[parts.length - 1] === 'index') parts.pop();

			const dynamic = parts
				.filter(part => part[0] === '%')
				.map(part => part.slice(1, -1));

			const pattern = new RegExp(
				`^\\/${parts.map(p => p[0] === '%' ? '([^/]+)' : p).join('\\/')}$`
			);

			const test = url => pattern.test(url);

			const exec = url => {
				const match = pattern.exec(url);
				if (!match) return;

				const params = {};
				dynamic.forEach((param, i) => {
					params[param] = match[i + 1];
				});

				return params;
			};

			return {
				file,
				test,
				exec,
				parts,
				dynamic
			};
		})
		.sort((a, b) => {
			return (
				(a.dynamic.length - b.dynamic.length) || // match static paths first
				(b.parts.length - a.parts.length) // match longer paths first
			);
		})
		.map(matcher => {
			return {
				file: matcher.file,
				test: matcher.test,
				exec: matcher.exec
			}
		});
}