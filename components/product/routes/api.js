var express = require('express');
var router = express.Router();
const controller = require("../controller");

/* POST products create. */
router.post('/products', controller.create);

/* GET products listing all. */
router.get('/products', controller.list);

/* GET products find. */
router.get('/products/:id', controller.find);

/* GET products find by id Rollercoin. */
router.get('/products/by-id-rollercoin/:id', controller.findbyIdRollercoin);

/* GET products search. */
router.post('/products/search', controller.search);

/* PUT products update. */
router.put('/products/:id', controller.edit);

/* DELETE products delete. */
router.delete('/products/:id', controller.remove);

/* DELETE products delete many by id. */
router.post('/products/delete-many-by-id', controller.deleteManyById);

/* PATCH . */
router.patch('/products', controller.update);

/* DELETE products delete many by id. */
router.post('/products/delete-price-history-by-idrollercoin', controller.updatePriceHistoryByIdRollercoin);

module.exports = router;