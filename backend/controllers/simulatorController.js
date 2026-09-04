/**
 * Simulator Controller
 */

import { SimulatorService } from '../services/simulatorService.js';
import { GeminiService } from '../services/geminiService.js';

export const runSimulation = async (req, res) => {
  try {
    const { detectionMinuteOffset, strategy, maxCardRetries, instantFallbackOffer } = req.body;
    
    const simulationResult = SimulatorService.simulateScenario({
      detectionMinuteOffset,
      strategy,
      maxCardRetries,
      instantFallbackOffer
    });

    // Generate AI interpretation
    const aiExplanation = await GeminiService.explainCounterfactual(simulationResult);

    res.json({
      success: true,
      data: {
        ...simulationResult,
        aiExplanation
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPresets = (req, res) => {
  try {
    const presets = SimulatorService.getPresets();
    res.json({ success: true, data: presets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
