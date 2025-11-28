const express = require('express');
const { parseBookingRequest, confirmBooking } = require('../controllers/llmController');

const router = express.Router();

router.post('/parse', parseBookingRequest);
router.post('/book', confirmBooking);

module.exports = router;
