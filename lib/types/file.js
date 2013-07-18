var common = require('../common'),
	Prompter = require('../prompter'),
	fs = require('fs'),
	path = require('path'),
	util = require('util');

module.exports = File;

function File(opts) {
	if (this instanceof File) {
		File.super_.call(this);

		// defaults
		this.showHidden = true;

		common.mix(this, this._defaults, opts);
	} else {
		return new File(opts);
	}
}

util.inherits(File, Prompter);

File.prototype._complete = function (value, callback) {
	var caseSensitive = process.platform != 'win32',
		p = value.lastIndexOf(path.sep) + 1,
		filename = caseSensitive ? value.substring(p) : value.substring(p).toLowerCase(),
		dir = value.substring(0, p),
		absDir = common.resolvePath(dir),
		matches = [],
		diff = [],
		shortest = -1,
		i, j, same;

	if (fs.existsSync(absDir)) {
		fs.readdirSync(absDir).forEach(function (name) {
			var file = path.join(absDir, name),
				isDir = fs.statSync(file).isDirectory();
			if ((!isDir || !this.ignoreDirs || !this.ignoreDirs.test(name))
				&& (isDir || !this.ignoreFiles || !this.ignoreFiles.test(name))
				&& (this.showHidden || name.charAt(0) != '.')
				&& (filename == ''
					|| (caseSensitive && name.indexOf(filename) == 0)
					|| (!caseSensitive && name.toLowerCase().indexOf(filename) == 0))
			) {
				try {
					var stat = fs.lstatSync(path.join(absDir, name));
					if (stat.isDirectory()) {
						matches.push(name + path.sep);
					} else {
						matches.push(name);
					}
				} catch (ex) {
					matches.push(name);
				}
				var s = name.substring(filename.length);
				if (s.length) {
					if (shortest == -1) {
						shortest = s.length;
					} else {
						shortest = Math.min(shortest, s.length);
					}
					diff.push(s);
				}
			}
		}.bind(this));
	}

	if (matches.length == 1) {
		// only 1 match, so just return it now
		callback(path.join(dir, matches[0]));
	} else if (diff.length > 1) {
		// auto complete as much as we can
		for (i = 0; i < shortest; i++) {
			same = true;
			for (j = 1; j < diff.length; j++) {
				if (diff[j][i] != diff[j-1][i]) {
					same = false;
					break;
				}
			}
			if (same) {
				value += diff[0][i]; // if char at "i" is the same, then just take it from the first string
			} else {
				break;
			}
		}
		callback(value, matches);
	} else {
		callback(value);
	}
};

File.prototype.prompt = function (callback) {
	this.title && this._println(this.formatters.title ? this.formatters.title(this) : this._format('title'));
	this.desc && this._println(this.formatters.desc ? this.formatters.desc(this) : this._format('desc'));
	this._get(callback);
};
