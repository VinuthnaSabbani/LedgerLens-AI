/**
 * Transactions Controller
 */

import { dbService } from '../services/databaseService.js';

export const getTransactions = (req, res) => {
  try {
    const { method, status, bank, limit } = req.query;
    const transactions = dbService.getTransactions({ method, status, bank, limit });
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
