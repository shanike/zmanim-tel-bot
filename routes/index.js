var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  return res.send({ online: true });
});

module.exports = router;
