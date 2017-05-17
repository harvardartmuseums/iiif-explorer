var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'IIIF Stickers' });
});

router.get('/note-generator', function(req, res, next) {
  res.render('note-generator', { title: 'IIIF Stickers' });
});

router.get('/faces/compare', function(req, res, next) {
  res.render('face-compare', { title: 'IIIF Stickers' });
});


module.exports = router;
