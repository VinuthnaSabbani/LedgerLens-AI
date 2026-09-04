/**
 * Incidents Routes
 */
import express from 'express';
import {
  getIncidents,
  getIncidentById,
  approveAction,
  executeAction,
  getPostmortems,
  getPostmortemById
} from '../controllers/incidentsController.js';

const router = express.Router();

router.get('/', getIncidents);
router.get('/postmortems', getPostmortems);
router.get('/postmortems/:id', getPostmortemById);
router.get('/:id', getIncidentById);
router.post('/:id/approve', approveAction);
router.post('/:id/execute', executeAction);

export default router;
