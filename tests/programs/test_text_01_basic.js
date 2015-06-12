var fields = require('../../lib');

fields.text({
	 title: 'Enter something',
	 desc: 'It can be anything really'
}).prompt(function (err, result) {
	if (err) {
		console.error(err);
		process.exit(1);
	} else {
		console.info(result);
	}
});