const express = require("express");
const router = express.Router();
const breedsController = require('../controllers/breedsController');

router.get("/breeds", breedsController.allBreeds);

module.exports = router;