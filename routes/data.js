var request = require('request');
var express = require('express');
var router = express.Router();

var apikey = process.env.APIKEY;
var apiURL = "http://api.harvardartmuseums.org";

router.get('/object/:objectid', function(req, res, next) {
	var url = apiURL;
	var objectid = req.params.objectid;

	url += "/object/" + objectid;

	request(url, {
			qs: {
				apikey: apikey
			}
		}, function(error, response, body) {
			var r = JSON.parse(body);

			res.send(r);
		});

});

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

/* GET term. */
router.get('/terms/:term', function(req, res, next) {
	var url = apiURL + "/experimental/object";
	var term = req.params.term;
	var size = req.query.size || 25;

	if (term) {

		request(url, {
				qs: {
					apikey: apikey, 
					q: 'images.googlevision.responses.textAnnotations.description:' + term,
					fields: 'id,images.googlevision.responses.textAnnotations,images.iiifbaseuri,images.scalefactor',
					sort: 'random',
					size: size
				}
			}, function(error, response, body) {
				var r = JSON.parse(body);
				var output = [];

				if (!r.error) {
					for (var i = 0; i < r.records.length; i++) {
						var images = r.records[i].images;
						var objectID = r.records[i].id;
						
						images.forEach(function(i) {
							if (i.googlevision.responses[0]) {
								if (i.googlevision.responses[0].textAnnotations) {
									text = i.googlevision.responses[0].textAnnotations;
									text.forEach(function(t) {
										if (t.description.toUpperCase() === term.toUpperCase()) {
											t.objectid = objectID;
											t.iiifbaseuri = i.iiifbaseuri;
											t.scalefactor = i.scalefactor;
											output.push(t);
										}
									});
								}								
							}
						});
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

module.exports = router;
