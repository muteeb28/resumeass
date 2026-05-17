import { Router } from 'express';
import { getJobs, getJobsMeta, triggerIngestion } from '../controller/jobsRead.controller.js';

const router = Router();

router.get('/jobs', getJobs);
router.get('/jobs/meta', getJobsMeta);
router.post('/jobs/ingest', triggerIngestion);

export default router;
