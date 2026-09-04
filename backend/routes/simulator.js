/**
 * Simulator Routes
 */
import express from 'express';
import { runSimulation, getPresets } from '../controllers/simulatorController.js';

const router = express.Router();

router.post('/run', runSimulation);
router.get('/presets', getPresets);

export default router;
