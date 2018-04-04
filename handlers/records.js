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
		var snapshot_file = "./data/" + "snapshot-" + uuid + ".json";
		var ori_count = 0, mot_count = 0, geo_count = 0, snap_count = 0;

		var orientation_string = "";
		data.orientations.forEach(function(orientation) {
			orientation_string += ",\n" + JSON.stringify(orientation);
			ori_count ++;
		});
		if (!fs.existsSync(orientation_file)) {
			orientation_string = orientation_string.substring(2, orientation_string.length);
		}
		if (orientation_string.length > 0) {
			fs.appendFileSync(orientation_file, orientation_string);
		}

		var motion_string = "";
		data.motions.forEach(function(motion) {
			motion_string += ",\n" + JSON.stringify(motion);
			mot_count ++;
		});
		if (!fs.existsSync(motion_file)) {
			motion_string = motion_string.substring(1, motion_string.length);
		}
		if (motion_string.length > 0) {
			fs.appendFileSync(motion_file, motion_string);
		}

		var geolocation_string = "";
		data.geolocations.forEach(function(geolocation) {
			geolocation_string += ",\n" + JSON.stringify(geolocation);
			geo_count ++;
		});
		if (!fs.existsSync(geolocation_file)) {
			geolocation_string = geolocation_string.substring(2, geolocation_string.length);
		}
		if (geolocation_string.length > 0) {
			fs.appendFileSync(geolocation_file, geolocation_string);
		}

		var snapshot_string = "";
			if (data.snapshots) {
			data.snapshots.forEach(function(snapshot) {
				snapshot_string += ",\n" + JSON.stringify(snapshot);
				snap_count ++;
			});
			if (!fs.existsSync(snapshot_file)) {
				snapshot_string = snapshot_string.substring(2, snapshot_string.length);
			}
			if (snapshot_string.length > 0) {
				fs.appendFileSync(snapshot_file, snapshot_string);
			}
		}

		var response = { uuid: uuid,
			ori_count: ori_count, mot_count, mot_count,
			geo_count: geo_count, snap_count: snap_count };
		res.send(JSON.stringify(response));
	});

}

