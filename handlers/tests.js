var date = require('../lib/date');

exports.test = test;

function test(req, res) {
	console.log(req.headers.cookie);
	var date_string = date.local_string(new Date());
	res.send(date_string);
}
