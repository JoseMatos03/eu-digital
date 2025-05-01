const express = require('express');
const multer = require('multer');
const router = express.Router();

const apiController = require('../controllers/apiController');

const upload = multer({ dest: 'tmp_sips/' });

router.post('/ingest', upload.single('sip'), apiController.handleIngest);

module.exports = router;
