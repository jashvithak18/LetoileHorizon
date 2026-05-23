import express from 'express';
import { getAiRecommendation } from '../controllers/aiController.js';

const router = express.Router();

router.post('/recommend', getAiRecommendation);

export default router;
