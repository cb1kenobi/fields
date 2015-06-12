'use strict';

var fields = require('../lib');

describe('Text Field', function () {
	it('should create a text field with defaults', function () {
		var t = fields.text();
		should(t).be.an.Object;
		should(t).have.property('prompt');
		should(t).have.property('title');
		should(t.title).eql('');
		should(t).have.property('desc');
		should(t.desc).eql('');
	});

	it('should create a text field with custom title & desc', function () {
		var t = fields.text({
			 title: 'Enter something',
			 desc: 'It can be anything really'
		});
		should(t).be.an.Object;
		should(t).have.property('prompt');
		should(t).have.property('title');
		should(t.title).eql('Enter something');
		should(t).have.property('desc');
		should(t.desc).eql('It can be anything really');
	});

	it('should create a text field and prompt', function (done) {
		nixt()
			.run(process.execPath + ' tests/programs/test_text_01_basic.js')
			.on('Enter something\nIt can be anything really\n: ')
			.respond('foo')
			.stdout('foo')
			.end(done);
	});


//		t.prompt(
/*
var set = fields.set({
	text: fields.text({
		title: 'Enter something',
		desc: 'It can be anything really',
		default: 'Chris Barber',
		validate: function (value, callback) {
			callback(!value.length, value);
		}
	}),
	password: fields.text({
		title: 'Enter a password',
		index: 1,
		password: true,
		validate: function (value, callback) {
			!value && console.error('you must enter a password');
			callback(!value, value);
		}
	})
*/
});
