var common = require('./common'),
	keypress = require('keypress'),
	history = [];

module.exports = Prompter;

function Prompter() {
	this.complete = false;
	this.formatters = {};
	this.style = {};
	this.trim = true;
}

Prompter.prototype._format = function (str, style) {
	str = String(str);

	if (!style && this.hasOwnProperty(str)) {
		return this._format(this[str], str);
	}

	str = str.split(/(__.+?__)/);

	if (this.colors && Array.isArray(style)) {
		style.forEach(function (s) {
			try {
				if (this.style.hasOwnProperty(s)) {
					str = str.map(function (i) {
						return /^__.+__$/.test(i) ? i : str[this.style[s]];
					}.bind(this));
				} else {
					str = str.map(function (i) {
						return /^__.+__$/.test(i) ? i : (s in i ? i[s] : i);
					});
				}
			} catch (ex) {}
		});
	} else if (this.colors && style && typeof style == 'string') {
		try {
			if (this.style.hasOwnProperty(style)) {
				var ss = this.style[style];
				if (ss) {
					if (Array.isArray(ss)) {
						ss.forEach(function (x) {
							str = str.map(function (i) {
								return /^__.+__$/.test(i) ? i : i[x];
							});
						});
					} else {
						str = str.map(function (i) {
							return /^__.+__$/.test(i) ? i : i[ss];
						});
					}
				}
			} else {
				str = str.map(function (i) {
					return /^__.+__$/.test(i) ? i : (style in i ? i[style] : i);
				});
			}
		} catch (ex) {}
	}

	return str.map(function (i) {
		return i.replace(/__(.+?)__/, function (s, m) {
			var ss = this.style.accelerator;
			if (Array.isArray(ss)) {
				ss.forEach(function (x) {
					m = m[x];
				});
			} else {
				m = m[ss];
			}
			return m;
		}.bind(this));
	}.bind(this)).join('');
};

Prompter.prototype.reset = function () {
	history = [];
};

Prompter.prototype._print = function (str) {
	process.stdout.write(str || '');
};

Prompter.prototype._println = function (str) {
	process.stdout.write((str || '') + '\n');
};

Prompter.prototype._getByNumber = function (value) {
	return value;
};

Prompter.prototype._get = function (callback) {
	var prompt = '',
		margin = 0,
		caret = 0,
		historyIdx = history.length,
		mask = this._format(this.mask != undefined && (''+this.mask).charAt(0) || '*', 'mask'),
		hidden = this.hidden;

	if (this.promptLabel) {
		prompt += this._format('promptLabel') + (this.promptValues || this.default ? ' ' : '');
	}
	if (this.promptValues) {
		prompt += this._format(this.promptValuesLeft + (Array.isArray(this.promptValues) ? this.promptValues.join(this.promptValuesSeparator) : this.promptValues) + this.promptValuesRight, 'promptValues') + (this.default ? ' ' : '');
	}
	if (this.hasOwnProperty('default') && this.default !== void 0) {
		prompt += this._format('defaultLeft') + this._format('default') + this._format('defaultRight');
	}
	prompt += this._format('separator');

	margin = prompt.stripColors.length;

	function reset(value) {
		process.stdout.write(prompt);
		history[++historyIdx] = '';
		caret = 0;
		process.stdout.cursorTo(margin);
	}

	function done(err, value) {
		process.stdin.pause();
		process.stdin.removeAllListeners('keypress');
		process.stdin.setRawMode(false);
		callback(err, hidden ? undefined : value);
	}

	history[historyIdx] = '';
	keypress(process.stdin);

	process.stdout.write(prompt);

	process.stdin.on('keypress', function(c, key) {
		var value, last;
		switch (key && key.name || c) {
			case 'enter':
				process.stdout.write('\n');

				value = history[historyIdx].length ? history[historyIdx] : '' + (this.default || '');
				this.trim && (value = value.trim());

				// if this is a password or the value is empty, remove it from the history
				if (this.password || !value) {
					history.pop();
					historyIdx--;
				}

				if (this.numbered) {
					value = this._getByNumber(value);
				}

				if (!this.validate) {
					return done(null, value);
				}

				try {
					var result = this.validate(value, function (err, value) {
						if (err) {
							if (typeof err == 'string' || err instanceof Error) {
								process.stdout.write(this._format(err, 'error') + '\n');
							}
							reset(value);
						} else {
							done(null, value);
						}
					}.bind(this));

					// if result is undefined, then we assume they are going to call the callback
					if (result === false) {
						reset(value);
					} else if (result === true) {
						done(null, value);
					}
				} catch (ex) {
					process.stdout.write(this._format(ex, 'error') + '\n');
					reset(value);
				}

				return;

			case 'backspace':
				if (caret && history[historyIdx].length) {
					history[historyIdx] = history[historyIdx].substring(0, caret - 1) + history[historyIdx].substring(caret);
					process.stdout.cursorTo(--caret + margin);
					if (this.password) {
						process.stdout.write((new Array(history[historyIdx].length - caret + 1)).join(mask) + ' ');
					} else {
						process.stdout.write(this._format(history[historyIdx].substring(caret), 'input') + ' ');
					}
					process.stdout.cursorTo(caret + margin);
				} else {
					process.stdout.write('\007'); // beep beep!
				}
				break;

			case 'delete':
				if (history[historyIdx].length) {
					history[historyIdx] = history[historyIdx].substring(0, caret) + history[historyIdx].substring(caret + 1);
					if (this.password) {
						process.stdout.write((new Array(history[historyIdx].length - caret + 1)).join(mask) + ' ');
					} else {
						process.stdout.write(this._format(history[historyIdx].substring(caret), 'input') + ' ');
					}
					process.stdout.cursorTo(caret + margin);
				}
				break;

			case 'left':
				if (caret) {
					process.stdout.cursorTo(--caret + margin);
				}
				break;

			case 'right':
				if (caret < history[historyIdx].length) {
					process.stdout.cursorTo(++caret + margin);
				}
				break;

			case 'home':
				caret = 0;
				process.stdout.cursorTo(margin);
				break;

			case 'end':
				caret = history[historyIdx].length
				process.stdout.cursorTo(caret + margin);
				break;

			case 'up':
				if (!this.password && historyIdx) {
					value = history[--historyIdx];
					last = history[historyIdx + 1];
					process.stdout.cursorTo(margin);
					process.stdout.write(this._format(value, 'input') + (value.length < last.length ? (new Array(last.length - value.length + 1)).join(' ') : ''));
					caret = history[historyIdx].length;
					process.stdout.cursorTo(caret + margin);
				}
				break;

			case 'down':
				if (!this.password && historyIdx < history.length - 1) {
					value = history[++historyIdx];
					last = history[historyIdx - 1];
					process.stdout.cursorTo(margin);
					process.stdout.write(this._format(value, 'input') + (value.length < last.length ? (new Array(last.length - value.length + 1)).join(' ') : ''));
					caret = history[historyIdx].length;
					process.stdout.cursorTo(caret + margin);
				}
				break;

			case 'tab':
				if (this.complete && this._complete && history[historyIdx].length) {
					this._complete(history[historyIdx], function (value, matches) {
						if (this._lastKey && this._lastKey.name == 'tab' && matches && matches.length) {
							this._print('\n' + common.renderGrid(this.margin, matches.map(function (m) {
								return this._format(m, 'suggestion');
							}.bind(this))));
							process.stdout.write(prompt + this._format(value, 'input'));
						} else {
							process.stdout.cursorTo(margin);
							process.stdout.write(this._format(value, 'input'));
						}
						history[historyIdx] = value;
						caret = value.length;
						process.stdout.cursorTo(caret + margin);
					}.bind(this));
				}
				break;

			case 'escape': case 'pageup': case 'pagedown': case 'undefined': case 'clear': case 'insert':
			case 'f1': case 'f2': case 'f3': case 'f4': case 'f5': case 'f6':
			case 'f7': case 'f8': case 'f9': case 'f10': case 'f11': case 'f12':
				// do nothing
				break;

			case 'c':
				if (key.ctrl) {
					return done(new Error('cancelled'));
				}
				// fall through

			default:
				var remainder = history[historyIdx].substring(caret);
				process.stdout.write(this.password ? mask + (remainder.length ? (new Array(remainder.length + 1)).join(mask) : '') : this._format(c + remainder, 'input'));
				history[historyIdx] = history[historyIdx].substring(0, caret) + c + remainder;
				process.stdout.cursorTo(++caret + margin);
		}

		this._lastChar = c;
		this._lastKey = key;
	}.bind(this));

	process.stdin.setRawMode(true);
	process.stdin.resume();
};
