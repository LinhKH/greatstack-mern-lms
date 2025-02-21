import express from 'express';

import { getAllCourses, getCourseById, getCourseDetailWithPurchaseStatus } from '../controllers/course.controller.js';

const router = express.Router();

router.get('/all', getAllCourses);
router.get('/:id', getCourseById);
router.get('/:courseId/detail-with-status', getCourseDetailWithPurchaseStatus);

export default router;