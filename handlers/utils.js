var uuidv1 = require("uuid/v1");

exports.uuid = uuid;
exports.uuid_get = uuid_get;

function uuid_get(mac_address) {
	return uuidv1({
		node: mac_address.split(":").map(function(x) { return parseInt(x, 16) }),
		clockseq: 0x8888,
		msecs: new Date().getTime(),
		nsecs: 9999
	});
}

function uuid(req, res) {
	var uuid_string = uuid_get('00:12:34:56:78:9a');
	res.send(uuid_string);
}
