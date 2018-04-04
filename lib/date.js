exports = module.exports = {};

exports.local_string = local_string;

function local_string(date) {
	return date.getFullYear()
		+ "/" + ("00"+(date.getMonth()+1)).substr(-2,2)
		+ "/" + ("00"+date.getDate()).substr(-2,2)
		+ " " + ("00"+date.getHours()).substr(-2,2)
		+ ":" + ("00"+date.getMinutes()).substr(-2,2)
		+ ":" + ("00"+date.getSeconds()).substr(-2,2)
		+ "." + ("000"+date.getMilliseconds()).substr(-3,3);
}
