/**
 * Analytics Controller
 */

import { dbService } from '../services/databaseService.js';
import { getDatabaseStatus } from '../config/db.js';

export const getOverview = (req, res) => {
  try {
    const overview = dbService.getFinancialOverview();
    const merchant = dbService.getMerchant();
    const dbStatus = getDatabaseStatus();
    res.json({ success: true, data: { ...overview, merchant, dbStatus } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getTrends = (req, res) => {
  try {
    const trends = dbService.getTrendCharts();
    res.json({ success: true, data: trends });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getProfitBridge = (req, res) => {
  try {
    const bridge = dbService.getProfitBridge();
    res.json({ success: true, data: bridge });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getSettlements = (req, res) => {
  try {
    const settlements = dbService.getSettlements();
    res.json({ success: true, data: settlements });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getRefunds = (req, res) => {
  try {
    const refunds = dbService.getRefunds();
    res.json({ success: true, data: refunds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getExpenses = (req, res) => {
  try {
    const expenses = dbService.getExpenses();
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
