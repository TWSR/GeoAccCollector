function date_local_string(date) {
	return date.getFullYear()
		+ "/" + ("00"+(date.getMonth()+1)).substr(-2,2)
		+ "/" + ("00"+date.getDate()).substr(-2,2)
		+ " " + ("00"+date.getHours()).substr(-2,2)
		+ ":" + ("00"+date.getMinutes()).substr(-2,2)
		+ ":" + ("00"+date.getSeconds()).substr(-2,2)
		+ "." + ("000"+date.getMilliseconds()).substr(-3,3);
}

var ori_date = new Date(), mot_date = new Date(), geo_date = new Date();
var ori_count = 0, mot_count = 0, geo_count = 0;
var orientations = [], motions = [], geolocations = [];
var snapshots = [];

function handleOrientation(event) {
	var date = new Date();
	ori_count ++;
	$("#orient").html(
		"alpha: " + event.alpha + "<br/>" +
		"beta: "  + event.beta  + "<br/>" + 
		"gamma: " + event.gamma + "<br/>" + 
		"time: "  + date_local_string(date)  + "<br/>" +
		"count: " + ori_count + "<br/>" +
		"data rate: "    + (ori_count / ((date - ori_date) / 1000))  + "<br/>");
	orientations.push({ alpha: event.alpha, beta: event.beta, gamma: event.gamma, time: date_local_string(date) });
}

function handleMotion(event) {
	var date = new Date();
	mot_count ++;
	$("#motion").html(
		"gacc.x: "    + event.accelerationIncludingGravity.x + "<br/>" +
		"gacc.y: "    + event.accelerationIncludingGravity.y + "<br/>" + 
		"gacc.z: "    + event.accelerationIncludingGravity.z + "<br/>" + 
		"acc.x: "     + event.acceleration.x + "<br/>" +
		"acc.y: "     + event.acceleration.y + "<br/>" + 
		"acc.z: "     + event.acceleration.z + "<br/>" + 
		"time: "      + date_local_string(date)  + "<br/>" +
		"count: "     + mot_count + "<br/>" +
		"data rate: " + (mot_count / ((date - mot_date) / 1000))  + "<br/>");
	motions.push({
		gacc_x: event.accelerationIncludingGravity.x,
		gacc_y: event.accelerationIncludingGravity.y,
		gacc_z: event.accelerationIncludingGravity.z,
		acc_x: event.acceleration.x,
		acc_y: event.acceleration.y,
		acc_z: event.acceleration.z,
		time: date_local_string(date) });
}

function handleGeolocation(position) {
	var date = new Date();
	geo_count ++;
	$("#geolocation").html(
		"latitude: "         + position.coords.latitude + "<br/>" +
		"longitude: "        + position.coords.longitude + "<br/>" + 
		"altitude: "         + position.coords.altitude + "<br/>" + 
		"accuracy: "         + position.coords.accuracy + "<br/>" + 
		"altitudeAccuracy: " + position.coords.altitudeAccuracy + "<br/>" + 
		"heading: "          + position.coords.heading + "<br/>" + 
		"speed: "            + position.coords.speed + "<br/>" + 
		"time: "             + date_local_string(date)  + "<br/>" +
		"count: "            + geo_count + "<br/>" +
		"data rate: "        + (geo_count / ((date - geo_date) / 1000) )  + "<br/>");
	geolocations.push({
		latitude: position.coords.latitude,
		longitude: position.coords.longitude,
		altitude: position.coords.altitude,
		accuracy: position.coords.accuracy,
		altitudeAccuracy: position.coords.altitudeAccuracy,
		heading: position.coords.heading,
		speed: position.coords.speed,
		time: date_local_string(date) });
}

function pop_message(message) {
	$("#message").html(message);
}

function pop_debug_message(message) {
	$("#debug_message").html($("#debug_message").html() + "<br/>" + message);
}

function is_iphone_ipad() {
	return /iPhone/i.test(navigator.userAgent) || /iPad/i.test(navigator.userAgent);
}

function initVideo() {
	var video_width = 800, video_height = 600;
	navigator.mediaDevices.enumerateDevices()
		.then(function(devices) {
			var devs = devices.filter(function(d) {
				return d.kind == "videoinput";
			});
			// pop_debug_message(JSON.stringify(devices));
			if (devs.length == 0) {
				pop_message("No camera not found.");
				return;
			}
			// pop_debug_message(JSON.stringify(devs));
			devs.forEach(function(dev) {
				var video_facingMode = "environment";
				if (dev.label.toLowerCase().indexOf("front") > -1) {
					video_facingMode = "user";
				}
				// not iphone/ipad, use back camera
				if (!is_iphone_ipad() && dev.label.toLowerCase().indexOf("back") == -1) {
					return;
				}
				// just use one camera in iphone/ipad
				if (is_iphone_ipad() && devs.indexOf(dev) > 0) {
					return;
				}

				var constraints = {
					audio: false,
					video: {
						deviceId: { exact: dev.deviceId },
						facingMode: video_facingMode, width: video_width, height: video_height
					}
				};
				if (is_iphone_ipad()) {
					constraints = {
						audio: false,
						/* facingMode: environment for back, user for front */
						video: { facingMode: "environment" }
					};
				}
				navigator.mediaDevices.getUserMedia(constraints).then(function(media) {
					var deviceIndex = devs.indexOf(dev) + 1;
					var video = document.getElementById("camera" + deviceIndex);
					var canvas = document.getElementById("drawer" + deviceIndex);
					var context = canvas.getContext("2d");
					var img = document.getElementById("snapshot" + deviceIndex);
					video.setAttribute("width", video_width);
					video.setAttribute("height", video_height);
					if (is_iphone_ipad()) {
						video.setAttribute("autoplay", "");
						video.setAttribute("muted", "");
						video.setAttribute("playsinline", "");
						video.srcObject = media;
					}
					else {
						video.src = window.URL.createObjectURL(media);
					}
					canvas.setAttribute("width", video_width);
					canvas.setAttribute("height", video_height);
					video.play();

					setInterval(function snapshot() {
						if (!video.ended) {
							var date = new Date();
							context.drawImage(video, 0, 0);
							var data = canvas.toDataURL("image/jpeg", 0.5);
							snapshots.push({ image: data,
								time: date_local_string(date) });
							img.setAttribute("src", data);
						}
					}, 1000);
				}).catch(function(e) {
					pop_message("device getUserMedia: " + e.name + ": " + e.message + "<br/>" +
						e.toString() + "<br/>" + this.toString());
				});
			});
		}).catch(function(e) {
			pop_debug_message("device enumerate: " + e.name + ": " + e.message);
		});
}

var ori_cnt_sent = 0, mot_cnt_sent = 0, geo_cnt_sent = 0, snap_cnt_sent = 0;
function pushToServer() {
	var ori = orientations.splice(0, orientations.length);
	var mot = motions.splice(0, motions.length);
	var geo = geolocations.splice(0, geolocations.length);
	var data = { orientations: ori, motions: mot, geolocations: geo};
	var snap = snapshots.splice(0, snapshots.length);
	data.snapshots = snap;
	$.post('/recorder', JSON.stringify(data))
		.done(function(data){
			ori_cnt_sent += ori.length;
			mot_cnt_sent += mot.length;
			geo_cnt_sent += geo.length;
			snap_cnt_sent += snap.length;
			pop_message("<br/>Sent: " + JSON.stringify({
				ori_cnt: ori.length, mot_cnt: mot.length,
				geo_cnt: geo.length, snap_cnt: snap.length }) + "<br/>" +
				"Done: " + data + "<br/>" +
				"sent/left/sent_acc/all: <br/>" +
				"<blockquote>" +
				"orientation: " + ori.length + "/" + orientations.length + "/" + ori_cnt_sent + "/" + (ori_cnt_sent + orientations.length) + "<br/>" +
				"motion: " + mot.length + "/" + motions.length + "/" + mot_cnt_sent + "/" + (mot_cnt_sent + motions.length) +  "<br/>" +
				"geolocation: " + geo.length + "/" + geolocations.length + "/" + geo_cnt_sent + "/" + (geo_cnt_sent + geolocations.length) + "<br/>" +
				"snapshot: " + snap.length + "/" + snapshots.length + "/" + snap_cnt_sent + "/" + (snap_cnt_sent + snapshots.length) + "<br/>" +
				"</blockquote>");
		});
}

$(function() {
	if (window.DeviceOrientationEvent) {
		window.addEventListener("deviceorientation", handleOrientation, true);
	}

	if (window.DeviceMotionEvent) {
		window.addEventListener('devicemotion', handleMotion, true);
	}

	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(handleGeolocation,
			function() { console.log(arguments) }, { enableHighAccuracy: true, maximumAge: 100, timeout: 27000 });
		navigator.geolocation.getCurrentPosition(handleGeolocation);
	}

	initVideo();
	$("#uuid").html("UUID: " + Cookies.get("uuid"));
	$("#start_recording").button().click(pushToServer);
});
