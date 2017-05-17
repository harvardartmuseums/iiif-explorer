var request = require('request');
var express = require('express');
var router = express.Router();

var apikey = process.env.APIKEY;
var apiURL = "http://api.harvardartmuseums.org/experimental/object";


router.get('/terms/sample', function(req, res, next) {
	res.sent("sample set");
});

/* GET users listing. */
router.get('/terms/:term', function(req, res, next) {

	var term = req.params.term;
	if (term) {

		request(apiURL, {
				qs: {
					apikey: apikey, 
					q: 'images.googlevision.responses.textAnnotations.description:' + term,
					fields: 'images.googlevision.responses.textAnnotations',
					sort: 'random',
					size: 25
				}
			}, function(error, response, body) {
				var r = JSON.parse(body);
				var output = [];

				if (!r.error) {
					for (var i = 0; i < r.records.length; i++) {
						var images = r.records[i].images;

						images.forEach(function(i) {
							if (i.googlevision.responses[0]) {
								if (i.googlevision.responses[0].textAnnotations) {
									text = i.googlevision.responses[0].textAnnotations;
									text.forEach(function(t) {
										if (t.description.toUpperCase() === term.toUpperCase()) {
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

module.exports = router;
