var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/webhook/ticket', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
