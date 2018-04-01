var fs = require("fs");

exports.recorder = recorder;

function recorder(req, res) {
	var uuid = req.cookies.uuid;
	var body = "";
	if (!fs.existsSync("./data")) {
		fs.mkdirSync("./data");
	}

	req.on("data", function(data) {
		body += data;
	});

	req.on("end", function() {
		var data = JSON.parse(body);

		var orientation_file = "./data/" + "orientation-" + uuid + ".json";
		var motion_file = "./data/" + "motion-" + uuid + ".json";
		var geolocation_file = "./data/" + "geolocation-" + uuid + ".json";

		var orientation_string = "";
		data.orientations.forEach(function(orientation) {
			orientation_string += "," + JSON.stringify(orientation);
		});
		if (!fs.existsSync(orientation_file)) {
			orientation_string = orientation_string.substring(1, orientation_string.length);
		}
		if (orientation_string.length > 0) {
			fs.appendFileSync(orientation_file, orientation_string);
		}

		var motion_string = "";
		data.motions.forEach(function(motion) {
			motion_string += "," + JSON.stringify(motion);
		});
		if (!fs.existsSync(motion_file)) {
			motion_string = motion_string.substring(1, motion_string.length);
		}
		if (motion_string.length > 0) {
			fs.appendFileSync(motion_file, motion_string);
		}

		var geolocation_string = "";
		data.geolocations.forEach(function(geolocation) {
			geolocation_string += "," + JSON.stringify(geolocation);
		});
		if (!fs.existsSync(geolocation_file)) {
			geolocation_string = geolocation_string.substring(1, geolocation_string.length);
		}
		if (geolocation_string.length > 0) {
			fs.appendFileSync(geolocation_file, geolocation_string);
		}

		res.send("done");
	});

}
