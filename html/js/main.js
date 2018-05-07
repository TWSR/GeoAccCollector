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
var max_timestamp = 60000, timestamps = { ori: ori_date, mot: mot_date, geo: geo_date };

if (typeof twsr_filters === "function") {
	var filters = new twsr_filters();
}

var timeout_reload_timer = 0;
function timeout_reload() {
	var date = new Date();
	if ((date - timestamps.ori) > max_timestamp ||
		(date - timestamps.mot) > max_timestamp ||
		(date - timestamps.geo) > max_timestamp) {
		var dialog = $("<div class='dialog' title='Error Reload'><p>You must allow geolocation and camera for this webapp!!</p></div>").dialog({
			modal: true,
			dialogClass: "no-close",
			buttons: {
				"OK": function() {
					self.location.reload();
				}
			}
		})
		return false;
	}
	return true;
}

function handleOrientation(event) {
	if ($("#start_recording").val() === "Start Recording") return;
	var date = new Date();
	ori_count ++;
	$("#orient").html(
		"alpha: " + event.alpha + "<br/>" +
		"beta: "  + event.beta  + "<br/>" + 
		"gamma: " + event.gamma + "<br/>" + 
		"time: "  + date_local_string(date)  + "<br/>" +
		"count: " + ori_count + "<br/>" +
		"data rate: "    + (ori_count / ((date - ori_date) / 1000))  + "<br/>");
	var ori = { alpha: event.alpha, beta: event.beta, gamma: event.gamma, time: date_local_string(date) };
	if (filters && filters.ori_filter(ori) === false) return;
	timestamps.ori = date;
	orientations.push(ori);
}

function handleMotion(event) {
	if ($("#start_recording").val() === "Start Recording") return;
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
	var mot = {
                gacc_x: event.accelerationIncludingGravity.x,
                gacc_y: event.accelerationIncludingGravity.y,
                gacc_z: event.accelerationIncludingGravity.z,
                acc_x: event.acceleration.x,
                acc_y: event.acceleration.y,
                acc_z: event.acceleration.z,
                time: date_local_string(date) };
	if (filters && filters.mot_filter(mot) === false) return;
	timestamps.mot = date;
	motions.push(mot);
}

function handleGeolocation(position) {
	if ($("#start_recording").val() === "Start Recording") return;
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

	var geo = {
		latitude: position.coords.latitude,
		longitude: position.coords.longitude,
		altitude: position.coords.altitude,
		accuracy: position.coords.accuracy,
		altitudeAccuracy: position.coords.altitudeAccuracy,
		heading: position.coords.heading,
		speed: position.coords.speed,
		time: date_local_string(date) };
	if (filters && filters.geo_filter(geo) === false) return;
	timestamps.geo = date;
	geolocations.push(geo);
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
				if (!is_iphone_ipad() && dev.label != "" && dev.label.toLowerCase().indexOf("back") == -1) {
					return;
				}
				// just use one camera in iphone/ipad, if dev.label is empty, use one camera, too
				if ((is_iphone_ipad() || dev.label == "") && devs.indexOf(dev) > 0) {
					return;
				}

				var constraints = {
					audio: false,
					video: {
						deviceId: { exact: dev.deviceId },
						facingMode: video_facingMode, width: video_width, height: video_height
					}
				};
				if (is_iphone_ipad() || dev.label == "") {
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
					var canvas2 = document.getElementById("drawer2");
					var context = canvas.getContext("2d");
					var context2 = canvas2.getContext("2d");
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
					canvas2.setAttribute("width", window.innerWidth);
					canvas2.setAttribute("height", window.innerHeight);
					video.play();

					setInterval(function snapshot() {

						if (!video.ended) {
							var date = new Date();
							context.clearRect(0, 0, canvas.width, canvas.height);
							context.drawImage(video, 0, 0);
							context2.clearRect(0, 0, canvas2.width, canvas2.height);
							context2.drawImage(video, 0, 0, window.innerWidth, window.innerHeight);
							var data = canvas.toDataURL("image/jpeg", 0.75);
							if ($("#start_recording").val() === "Start Recording") return;
							snapshots.push({ image: data,
								time: date_local_string(date) });
							// disable base64 image src for better performance
							// img.setAttribute("src", data);
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

function start_recording_click() {
	if ($("#start_recording").val() == "Start Recording") {
		$("#start_recording").val("Stop Recording");
		var date = new Date();
		timestamps.ori = date;
		timestamps.mot = date;
		timestamps.geo = date;
		timeout_reload_timer = setInterval(timeout_reload, 1000);

		(function loop_push() {
			pushToServer();
			if ($("#start_recording").val() == "Stop Recording") {
				setTimeout(loop_push, 1000);
			}
		}) ();
	}
	else {
		$("#start_recording").val("Start Recording");
		clearInterval(timeout_reload_timer);
	}
}

function initDialog() {
	function confirmMeta() {
		var name = $("#name").val();
		var vehicle = $("#vehicle").val();
		if (name === "" || name === "Anon") {
			$("#validate-tips").addClass("ui-state-highlight");
			setTimeout(function() { $("#validate-tips").removeClass("ui-state-highlight") }, 1000);
		}
		else {
			Cookies.set("name", $("#name").val(), { expires: 30 });
			Cookies.set("vehicle", $("#vehicle").val(), { expires: 30 });
			dialog.dialog("close");
			update_uuid();
			setInterval(update_uuid, 300000);
		}
	}

	var dialog = $("#meta-form").dialog({
		modal: true,
		dialogClass: "no-close",
		buttons: {
			"OK": confirmMeta
		}
	});
	dialog.find("form").on("submit", function(event) {
		event.preventDefault();
		confirmMeta();
	});
	$("#vehicle").find("option").remove().end();
	$("#vehicle").append("<option>car</option><option>bus</option>");
	$("#vehicle").selectmenu();
	dialog.dialog("open");
}

function update_uuid() {
	$("#uuid").html(
		"UUID: " + Cookies.get("uuid") + "<br/>" +
		"Name: " + Cookies.get("name") + "&nbsp;&nbsp;&nbsp;&nbsp;" +
		"Vehicle: " + Cookies.get("vehicle")
	);
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
	$("#start_recording").button().click(start_recording_click);
	initDialog();

	//filters.postSomeThing()

});
