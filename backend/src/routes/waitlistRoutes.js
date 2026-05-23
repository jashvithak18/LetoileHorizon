import express from 'express';
import { getWaitlist, addToWaitlist, updateWaitlistStatus, getWaitlistAnalytics } from '../controllers/waitlistController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getWaitlist);
router.post('/', addToWaitlist);
router.put('/:id', protect, admin, updateWaitlistStatus);
router.get('/analytics', getWaitlistAnalytics);

export default router;
