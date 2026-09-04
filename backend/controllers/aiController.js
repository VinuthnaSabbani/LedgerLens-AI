/**
 * AI Controller
 */

import { GeminiService } from '../services/geminiService.js';
import { dbService } from '../services/databaseService.js';

export const explainIncident = async (req, res) => {
  try {
    const { incidentId } = req.body;
    const incident = dbService.getIncidentById(incidentId);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    const explanation = await GeminiService.explainIncident(incident);
    res.json({ success: true, data: explanation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const analyzeProfit = async (req, res) => {
  try {
    const { question = 'Why did my profit decrease this month?' } = req.body;
    const bridge = dbService.getProfitBridge();
    const result = await GeminiService.analyzeProfitChange(question, bridge);
    res.json({ success: true, data: result, bridge });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const generatePostmortem = async (req, res) => {
  try {
    const { incidentId } = req.body;
    const incident = dbService.getIncidentById(incidentId);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    const report = await GeminiService.generatePostmortemReport(incident, incident.recoveredRevenue || 165000);
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
