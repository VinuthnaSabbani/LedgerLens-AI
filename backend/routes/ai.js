/**
 * AI Routes
 */
import express from 'express';
import { explainIncident, analyzeProfit, generatePostmortem } from '../controllers/aiController.js';

const router = express.Router();

router.post('/explain-incident', explainIncident);
router.post('/analyze-profit', analyzeProfit);
router.post('/generate-postmortem', generatePostmortem);

export default router;
