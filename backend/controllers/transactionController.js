/**
 * Transaction Controller
 */
import { dbService } from '../services/databaseService.js';
import { razorpayService } from '../services/razorpayService.js';

export const getTransactions = (req, res) => {
  try {
    const filters = req.query;
    const transactions = dbService.getTransactions(filters);
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getTransactionById = (req, res) => {
  try {
    const { id } = req.params;
    const tx = dbService.transactions.find(t => t.id === id);
    if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });
    res.json({ success: true, data: tx });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getGatewayHealth = (req, res) => {
  try {
    const health = razorpayService.getGatewayRouteHealth();
    res.json({ success: true, data: health });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
