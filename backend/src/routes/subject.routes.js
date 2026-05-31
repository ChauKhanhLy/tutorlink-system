import express from 'express';
import { getSubjectById, getAllSubjects } from '../controllers/subject.controller.js';

const router = express.Router();

router.get('/', getAllSubjects);
router.get('/:id', getSubjectById);

export default router;
