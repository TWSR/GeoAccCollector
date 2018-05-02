function twsr_filters() {
	var cache_length = 100;
	var ori_cache = [];
	var mot_cache = [];
	var geo_cache = [];

	this.ori_filter = function(ori) {
		ori_cache.push(ori);
		ori_cache.splice(0, ori_cache.length - cache_length);
		return true;
	}

	this.mot_filter = function(mot) {
		mot_cache.push(mot);
		mot_cache.splice(0, mot_cache.length - cache_length);
		return true;
	}

	this.geo_filter = function(geo) {
		geo_cache.push(geo);
		geo_cache.splice(0, geo_cache.length - cache_length);
		return true;
	}

	return this;
}

