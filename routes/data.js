var request = require('request');
var express = require('express');
var router = express.Router();

var apikey = process.env.APIKEY;
var apiURL = "http://api.harvardartmuseums.org";

router.get('/object/:objectid/:section', function(req, res, next) {
	var url = apiURL;
	var section = req.params.section;
	var objectid = req.params.objectid;

	if (section === "experimental") {
		url += "/experimental/object/" + objectid;
	} else if (section === "images") {
		url += "/object/" + objectid + "/images";
	}

	request(url, {
			qs: {
				apikey: apikey
			}
		}, function(error, response, body) {
			var r = JSON.parse(body);

			res.send(r);
		});
});

router.get('/image/:imageid/:section', function(req, res, next) {
	var url = apiURL;
	var section = req.params.section;
	var imageid = req.params.imageid;

	if (section === "objects") {
		url += "/object";
	}

	request(url, {
			qs: {
				apikey: apikey,
				q: 'images.imageid:' + imageid
			}
		}, function(error, response, body) {
			var r = JSON.parse(body);

			res.send(r["records"]);
		});
});

/* GET term. */
router.get('/terms/:term', function(req, res, next) {
	const endpoint = "/annotation";
	var url = apiURL + endpoint;
	var term = req.params.term;
	var size = req.query.size || 25;

	if (term) {

		request(url, {
				qs: {
					apikey: apikey, 
					q: 'type:text AND body:' + term,
					fields: 'id,body,target,imageid,selectors',
					sort: 'random',
					size: size
				}
			}, function(error, response, body) {
				var r = JSON.parse(body);
				var output = [];

				if (!r.error) {
					for (var i = 0; i < r.records.length; i++) {
						if (r.records[i].body.toUpperCase() === term.toUpperCase()) {
							output.push(r.records[i]);
						}
					}
				} else {

				}

				res.send(output);
			});

	} else {
		res.send("no term");
	}


});


router.get('/manifests/list/:thing', function(req, res, next) {
	var manifestList = [];
	var url = apiURL;
	var qs = {};
	var thing = req.params.thing || "object";
	var iiifManifestBaseURL = "https://iiif.harvardartmuseums.org/manifests"; 

	if (thing === "object") {
		url += "/object";
		qs = {apikey: apikey, sort: 'random', fields: 'id', gallery: 'any', hasimage: 1, size: 50};
	} else {
		url += "/gallery";
		qs = {apikey: apikey, sort: 'id', fields: 'id', floor: '1|2|3', size:100};
	}

	// Generate a list of manifests
 	request(url, {qs: qs}, function(error, response, body) {
  		var r = JSON.parse(body);
  	
		if (!r.error) {
	  		for (var i = 0; i < r.records.length; i++) {
	  	    	var manifest = {
	          		"manifestUri": iiifManifestBaseURL + "/" + thing + "/" + r.records[i].id,
	          		"location": "Harvard Art Museums"
	        	};
	       		manifestList.push(manifest);
	  	  	}

	      	res.send(manifestList);

		} else {
	  		res.send("");
	  	}
	});
});


router.get('/:endpoint', function(req, res, next) {
	var url = apiURL;
	var endpoint = req.params.endpoint;
    var qs = {
        apikey: apikey
    };

    for (var param in req.query) {
        qs[param] = req.query[param];
    }

    url += "/" + endpoint;

    request(url, {
			qs: qs
		}, function(error, response, body) {
			var r = JSON.parse(body);

			//cleanup the results before passing them out
			delete(r.info.next);
			delete(r.info.previous);
			
			res.send(r);
		});

});

router.get('/:endpoint/:itemid', function(req, res, next) {
	var url = apiURL;
    var itemid = req.params.itemid;
    var endpoint = req.params.endpoint;

	url += "/" + endpoint + "/" + itemid;

	request(url, {
			qs: {
				apikey: apikey
			}
		}, function(error, response, body) {
			var r = JSON.parse(body);

			res.send(r);
		});

});

module.exports = router;
