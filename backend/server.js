/**
 * LedgerLens AI - Express REST API Server & Static File Server
 * Port 3000
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import analyticsRoutes from './routes/analytics.js';
import incidentsRoutes from './routes/incidents.js';
import transactionsRoutes from './routes/transactions.js';
import simulatorRoutes from './routes/simulator.js';
import aiRoutes from './routes/ai.js';
import razorpayRoutes from './routes/razorpay.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, '..', 'frontend');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend assets (css, js, html)
app.use(express.static(frontendDir));

// API Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/razorpay', razorpayRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'LedgerLens AI - Financial Incident Intelligence System',
    track: 'Razorpay Buildathon Track 04: AI Finance Controller',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// HTML Page Route Fallbacks
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.get(['/dashboard', '/dashboard.html'], (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.get(['/incidents', '/incidents.html'], (req, res) => {
  res.sendFile(path.join(frontendDir, 'incidents.html'));
});

app.get(['/investigation', '/investigation.html'], (req, res) => {
  res.sendFile(path.join(frontendDir, 'investigation.html'));
});

app.get(['/simulator', '/simulator.html'], (req, res) => {
  res.sendFile(path.join(frontendDir, 'simulator.html'));
});

app.get(['/profit', '/profit.html', '/profit-analysis', '/profit-analysis.html'], (req, res) => {
  res.sendFile(path.join(frontendDir, 'profit.html'));
});

app.get(['/postmortem', '/postmortem.html'], (req, res) => {
  res.sendFile(path.join(frontendDir, 'postmortem.html'));
});

app.get(['/data-sources', '/datasources', '/datasources.html', '/data-sources.html'], (req, res) => {
  res.sendFile(path.join(frontendDir, 'datasources.html'));
});

app.get(['/settings', '/settings.html'], (req, res) => {
  res.sendFile(path.join(frontendDir, 'settings.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 LedgerLens AI Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 AI Finance Controller - Razorpay Track 04`);
  console.log(`📁 Frontend Directory: ${frontendDir}`);
  console.log(`=======================================================`);
});

export default app;
