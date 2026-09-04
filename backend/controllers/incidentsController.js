/**
 * Incidents Controller
 */

import { dbService } from '../services/databaseService.js';
import { GeminiService } from '../services/geminiService.js';

export const getIncidents = (req, res) => {
  try {
    const { status, severity } = req.query;
    const incidents = dbService.getIncidents(status, severity);
    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getIncidentById = (req, res) => {
  try {
    const { id } = req.params;
    const incident = dbService.getIncidentById(id);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    const relatedTransactions = dbService.getIncidentTransactions(id, 25);
    res.json({ success: true, data: incident, relatedTransactions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const approveAction = (req, res) => {
  try {
    const { id } = req.params;
    const { parameters } = req.body;
    const updatedIncident = dbService.approveIncidentAction(id, parameters);
    res.json({
      success: true,
      message: 'Action approved successfully. Ready for bounded execution.',
      data: updatedIncident
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const executeAction = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedIncident = dbService.executeIncidentAction(id);
    
    // Optionally trigger Gemini postmortem generation in background
    const postmortem = dbService.getPostmortemByIncidentId(id);

    res.json({
      success: true,
      message: 'Action executed successfully. Real-time traffic rerouted and outcome measured.',
      data: updatedIncident,
      postmortem
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPostmortems = (req, res) => {
  try {
    const postmortems = dbService.getPostmortems();
    res.json({ success: true, data: postmortems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPostmortemById = (req, res) => {
  try {
    const { id } = req.params;
    const postmortem = dbService.getPostmortemByIncidentId(id);
    if (!postmortem) {
      return res.status(404).json({ success: false, error: 'Postmortem not found for this incident' });
    }
    res.json({ success: true, data: postmortem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
