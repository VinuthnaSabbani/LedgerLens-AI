/**
 * Incident Controller
 */
import { dbService } from '../services/databaseService.js';
import { geminiService } from '../services/geminiService.js';

export const getIncidents = (req, res) => {
  try {
    const incidents = dbService.getIncidents();
    res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
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
    res.json({
      success: true,
      data: incident
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateIncidentStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = dbService.updateIncidentStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const approveAction = (req, res) => {
  try {
    const { id } = req.params;
    const { actionId, approvedBy, parameters } = req.body;
    const result = dbService.approveIncidentAction(id, actionId, { approvedBy, parameters });
    if (result.error) {
      return res.status(404).json({ success: false, error: result.error });
    }
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const completeRecovery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = dbService.completeIncidentRecovery(id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    // Attempt Gemini enhanced postmortem if available
    try {
      const aiPostmortem = await geminiService.generatePostmortem(result.incident, {
        recoveredAmount: result.incident.actual_recovered_amount
      });
      if (aiPostmortem && aiPostmortem.executiveSummary) {
        result.postmortem.executive_summary = aiPostmortem.executiveSummary;
        result.postmortem.lessons_learned = aiPostmortem.lessonsLearned || result.postmortem.lessons_learned;
        result.postmortem.prevention_rules = aiPostmortem.preventionRules || result.postmortem.prevention_rules;
      }
    } catch (e) {
      console.log('Postmortem AI generation fallback used');
    }

    res.json({ success: true, data: result });
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

export const getPostmortemByIncidentId = (req, res) => {
  try {
    const { id } = req.params;
    const pm = dbService.getPostmortemByIncidentId(id);
    if (!pm) return res.status(404).json({ success: false, error: 'Postmortem not found' });
    res.json({ success: true, data: pm });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
