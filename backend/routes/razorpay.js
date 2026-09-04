/**
 * Razorpay Routes
 */
import express from 'express';
import { razorpayService } from '../services/razorpayService.js';

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ success: true, data: razorpayService.getStatus() });
});

router.get('/payments', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const data = await razorpayService.getPayments(limit);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/settlements', async (req, res) => {
  try {
    const data = await razorpayService.getSettlements();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/refunds', async (req, res) => {
  try {
    const data = await razorpayService.getRefunds();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post(['/webhook-simulator', '/webhook/simulate'], (req, res) => {
  try {
    const eventType = req.body.eventType || req.body.event || 'card_failure_surge';
    let mappedType = eventType;
    if (eventType === 'payment.failed') mappedType = 'card_failure_surge';
    if (eventType === 'refund.speed_changed' || eventType === 'refund.processed') mappedType = 'refund_spike';
    
    const result = razorpayService.triggerAnomalyEvent(mappedType);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
