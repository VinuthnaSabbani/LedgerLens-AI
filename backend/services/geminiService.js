/**
 * LedgerLens AI - Gemini AI Service
 * Direct integration with Google GenAI SDK (@google/genai) for financial intelligence reasoning.
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

let aiClient = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        aiClient = new GoogleGenAI({ apiKey });
      } catch (e) {
        console.warn('Failed to initialize GoogleGenAI client:', e.message);
      }
    }
  }
  return aiClient;
}

export class GeminiService {
  /**
   * Explain an incident using Gemini
   */
  static async explainIncident(incident) {
    const client = getGeminiClient();
    if (!client) {
      return {
        summary: `Based on transaction telemetry for incident ${incident.incidentCode}, a severe anomaly was detected in ${incident.category.replace('_', ' ')}. ${incident.whatChanged}`,
        confidence: incident.confidenceScore || 91,
        source: 'Heuristic Financial Rule Engine'
      };
    }

    try {
      const prompt = `You are LedgerLens AI, a cautious and rigorous Chief Financial Officer & Payment Systems Intelligence Analyst.
Analyze the following merchant financial incident and explain what is happening in concise, executive terms:

Incident Code: ${incident.incidentCode}
Title: ${incident.title}
Category: ${incident.category}
Exposed Revenue: ₹${incident.exposedRevenue.toLocaleString('en-IN')}
What Changed: ${incident.whatChanged}
Root Cause Summary: ${incident.rootCauseSummary}
Primary Hypothesis: ${JSON.stringify(incident.primaryHypothesis)}

Respond with:
1. A clear 2-3 sentence executive breakdown answering "What is happening?".
2. Why this is commercially significant (in terms of merchant revenue exposure).
3. The confidence level and supporting evidence.
Maintain a cautious, factual tone. Do not use hyperbolic SaaS jargon.`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return {
        summary: response.text,
        confidence: incident.confidenceScore || 91,
        source: 'Google Gemini 2.5 Flash'
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local reasoning:', err.message);
      return {
        summary: `Analysis for ${incident.incidentCode}: ${incident.whatChanged} Primary finding shows ${incident.rootCauseSummary}. Estimated exposure of ₹${incident.exposedRevenue.toLocaleString('en-IN')}.`,
        confidence: incident.confidenceScore || 91,
        source: 'Heuristic Fallback Engine'
      };
    }
  }

  /**
   * Explain Counterfactual Simulation outcome
   */
  static async explainCounterfactual(simulationData) {
    const client = getGeminiClient();
    if (!client) {
      return {
        insight: `If the merchant had activated ${simulationData.scenario.strategy.replace('_', ' ')} ${Math.abs(simulationData.scenario.detectionOffsetMinutes)} minutes earlier at ${simulationData.scenario.detectionTime}, an estimated ₹${simulationData.simulatedOutcome.potentiallyPreservedRevenue.toLocaleString('en-IN')} could have been preserved, reducing potential loss by ${simulationData.simulatedOutcome.lossReductionPct}%.`,
        source: 'Simulator Analytical Model'
      };
    }

    try {
      const prompt = `You are a financial controller analyzing a counterfactual simulation for payment dropouts:
Actual Outcome: Detected at 2:30 PM, Lost: ₹${simulationData.actualOutcome.revenueLost.toLocaleString('en-IN')}.
Counterfactual Scenario: Detected at ${simulationData.simulatedOutcome.detectionTime} with strategy '${simulationData.scenario.strategy}'.
Estimated Loss: ₹${simulationData.simulatedOutcome.estimatedRevenueLoss.toLocaleString('en-IN')}.
Preserved Revenue: ₹${simulationData.simulatedOutcome.potentiallyPreservedRevenue.toLocaleString('en-IN')}.
Intervention Cost: ₹${simulationData.simulatedOutcome.estimatedInterventionCost.toLocaleString('en-IN')}.
Net Benefit: ₹${simulationData.simulatedOutcome.netPreservedBenefit.toLocaleString('en-IN')}.

Provide a sharp 2-paragraph economic interpretation of what could have been different and the key operational lesson for the merchant.`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return {
        insight: response.text,
        source: 'Google Gemini 2.5 Flash'
      };
    } catch (err) {
      return {
        insight: `Simulation indicates that earlier intervention via ${simulationData.scenario.strategy.replace('_', ' ')} would have saved ₹${simulationData.simulatedOutcome.potentiallyPreservedRevenue.toLocaleString('en-IN')} with net financial benefit of ₹${simulationData.simulatedOutcome.netPreservedBenefit.toLocaleString('en-IN')}.`,
        source: 'Simulator Fallback'
      };
    }
  }

  /**
   * Answer "Why did my profit change?" question
   */
  static async analyzeProfitChange(question, profitBridge) {
    const client = getGeminiClient();
    const promptSummary = `Merchant asks: "${question}"
Financial Context:
- Previous Month Profit: ₹${profitBridge.previousMonthProfit.toLocaleString('en-IN')}
- Current Month Profit: ₹${profitBridge.currentMonthProfit.toLocaleString('en-IN')}
- Variance: -₹${Math.abs(profitBridge.profitVariance).toLocaleString('en-IN')} (-12.4%)
Major Drivers:
1. Refund Spike on Product X: -₹80,000 (+42% returns on smart watches)
2. Payment Gateway Fees: -₹45,000 (duplicate retries on failing HDFC route)
3. Logistics & 3PL Surge: -₹52,000 (return freight charges)
4. Revenue Mix / Cart Dropouts: -₹33,000 (lost high-AOV checkouts)`;

    if (!client) {
      return {
        answer: `Your profit decreased by ₹2,10,000 this month (from ₹16,90,000 to ₹14,80,000). 
The variance is driven by four key factors:
1. **Refund Increase (-₹80,000)**: Acute return surge on the UltraSmart Watch Pro series due to battery firmware complaints.
2. **Operating & Logistics Expenses (-₹52,000)**: Extra reverse freight on returned orders.
3. **Payment Processing Fees (-₹45,000)**: Surge in failed card transaction retries incurring authorization processing charges.
4. **Revenue Checkout Variance (-₹33,000)**: Dropouts during gateway degraded windows.`,
        source: 'Heuristic Financial Decomposition'
      };
    }

    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are LedgerLens AI financial analyst. Answer the merchant's query clearly and systematically:
${promptSummary}

Explain the exact causal connections between these financial metrics. Break down the answer logically with bold headings.`
      });

      return {
        answer: response.text,
        source: 'Google Gemini 2.5 Flash'
      };
    } catch (err) {
      return {
        answer: `Your monthly profit fell by ₹2,10,000. The primary contributors are refund surge on Product X (-₹80,000), increased payment retry fees (-₹45,000), logistics freight (-₹52,000), and checkout dropout variance (-₹33,000).`,
        source: 'Decomposition Engine'
      };
    }
  }

  /**
   * Generate postmortem summary
   */
  static async generatePostmortemReport(incident, actualRecovery) {
    const client = getGeminiClient();
    const prompt = `Generate a formal, structured Financial Incident Postmortem for Razorpay merchant leadership:
Incident: ${incident.incidentCode} - ${incident.title}
Exposure: ₹${incident.exposedRevenue.toLocaleString('en-IN')}
Actual Recovered Revenue: ₹${actualRecovery.toLocaleString('en-IN')}
Net Financial Impact: ₹${(actualRecovery - 8000).toLocaleString('en-IN')} (Loss reduced by ${(actualRecovery/incident.exposedRevenue*100).toFixed(1)}%)
Root Cause: ${incident.rootCauseSummary}

Provide:
1. Executive Incident Summary
2. Root Cause & Technical Chain of Events
3. Financial Exposure vs Actual Recovery
4. Key Operational Lessons
5. Recommended Automated Prevention Rules for Razorpay configuration`;

    if (!client) {
      return {
        content: `### Financial Incident Postmortem: ${incident.incidentCode}\n\n**What happened?**\n${incident.whatChanged}\n\n**Why did it happen?**\n${incident.rootCauseSummary}\n\n**Financial Impact:**\n₹${incident.exposedRevenue.toLocaleString('en-IN')} exposed, ₹${actualRecovery.toLocaleString('en-IN')} recovered (loss reduced by ${((actualRecovery/incident.exposedRevenue)*100).toFixed(1)}%).\n\n**Action Taken:**\n${incident.recommendedAction?.title || 'Activated intelligent fallback routing'}.\n\n**Prevention Rules:**\n- Auto-trigger UPI fallback when card failure rate exceeds 12% for >10 mins.\n- Alert finance team on gateway route concentration >70%.`,
        source: 'Postmortem Template Engine'
      };
    }

    try {
      const resp = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return {
        content: resp.text,
        source: 'Google Gemini 2.5 Flash'
      };
    } catch (err) {
      return {
        content: `Postmortem generated for ${incident.incidentCode}: ₹${actualRecovery.toLocaleString('en-IN')} successfully preserved through intelligent routing.`,
        source: 'Postmortem Fallback'
      };
    }
  }
}
