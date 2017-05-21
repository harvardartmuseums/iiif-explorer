var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'IIIF Explorer' });
});

router.get('/magic-message', function(req, res, next) {
  res.render('magic-message', { title: 'Magic Message' });
});

router.get('/magnetic-poetry', function(req, res, next) {
  res.render('magnetic-poetry', { title: 'Magnetic Poetry' });
});

router.get('/face/match', function(req, res, next) {
  res.render('face-match', { title: 'Face Match' });
});

router.get('/face/scramble', function(req, res, next) {
  res.render('face-scramble', { title: 'Face Scramble' });
});


module.exports = router;
