import express from 'express';
import { parseBookingRequest, confirmBooking } from '../controllers/llmController.js';

const router = express.Router();

router.post('/parse', parseBookingRequest);
router.post('/book', confirmBooking);

export default router;
