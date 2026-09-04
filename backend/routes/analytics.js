/**
 * Analytics Routes
 */
import express from 'express';
import {
  getOverview,
  getTrends,
  getProfitBridge,
  getSettlements,
  getRefunds,
  getExpenses
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/overview', getOverview);
router.get('/trends', getTrends);
router.get('/profit-bridge', getProfitBridge);
router.get('/settlements', getSettlements);
router.get('/refunds', getRefunds);
router.get('/expenses', getExpenses);

export default router;
