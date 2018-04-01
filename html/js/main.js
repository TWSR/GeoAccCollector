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
	motions.push({ accelerationIncludingGravity: event.accelerationIncludingGravity, acceleration: event.acceleration, time: date_local_string(date) });
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

function pushToServer() {
	var ori = orientations.splice(0, orientations.length);
	var mot = motions.splice(0, motions.length);
	var geo = geolocations.splice(0, geolocations.length);
	var data = { orientations: ori, motions: mot, geolocations: geo};
	$.post('/recorder', JSON.stringify(data));
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

	$("#start_recording").button().click(pushToServer);
});