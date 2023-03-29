var express = require('express');
var router = express.Router();
const controller = require("../controller");

/* POST refresh create. */
router.get('/refresh', controller.all);

module.exports = router;
