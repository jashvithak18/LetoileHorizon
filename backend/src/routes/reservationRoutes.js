import express from 'express';
import { getReservations, createReservation, updateReservationStatus } from '../controllers/reservationController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getReservations);
router.post('/', protect, createReservation);
router.put('/:id', protect, admin, updateReservationStatus);

export default router;
