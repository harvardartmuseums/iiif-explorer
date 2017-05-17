var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'IIIF Stickers | Harvard Art Museums' });
});

router.get('/note-generator', function(req, res, next) {
  res.render('note-generator', { title: 'Note Generator | Harvard Art Museums' });
});

router.get('/face/scramble', function(req, res, next) {
  res.render('face-scramble', { title: 'Face Scramble | Harvard Art Museums' });
});


module.exports = router;
