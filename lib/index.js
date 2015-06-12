/**
 * The main entry point that defines the public API.
 *
 * @module fields
 *
 * @copyright
 * Copyright (c) Copyright (c) 2013-2015 Chris Barber
 *
 * @license
 * Licensed under the terms of the MIT License
 * Please see the LICENSE included with this distribution for details.
 */

'use strict';

var util = require('util');
global.dump = function () {
	for (var i = 0; i < arguments.length; i++) {
		console.error(util.inspect(arguments[i], false, null, true));
	}
};

var common = require('./common'),
	Field = require('./field');

exports.Field = Field;
/*
exports.File   = require('./types/file');
exports.file   = function (opts) { return new exports.File(opts); };

exports.Select = require('./types/select');
exports.select = function (opts) { return new exports.Select(opts); };
*/
exports.Text   = require('./types/text');
exports.text   = function (opts) { return new exports.Text(opts); };
/*
exports.Set    = require('./types/set');
exports.set    = function createSet(fields, opts) { return new exports.Set(fields, opts); };
*/
exports.setup = function setup(opts) {
	if (!opts || typeof opts !== 'object') {
		opts = {};
	}
	common.mix(Field.prototype, opts);
	require('colors').mode = defaults.colors ? 'console' : 'none';
	return exports;
};
