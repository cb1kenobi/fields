var common = require('../common'),
	Field = require('../field'),
	util = require('util');

module.exports = Text;

function Text(opts) {
	if (!(this instanceof Text)) return new Text(opts);
	Text.super_.call(this);
	common.mix(this, opts);
}

util.inherits(Text, Field);

Text.prototype.prompt = function prompt(callback) {
	this.emit('pre-prompt', this);
	this.title && this._println(this.formatters.title ? this.formatters.title(this) : this._format('title'));
	this.desc && this._println(this.formatters.desc ? this.formatters.desc(this) : this._format('desc'));
	this._get(callback);
};
