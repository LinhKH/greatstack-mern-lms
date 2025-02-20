import express from 'express';

import { getUserData, userEnrolledCourses, purchaseCourse, updateCourseProgress, getCourseProgress, addCourseRating, addCourseComment } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/data', getUserData);
router.get('/enrolled-courses', userEnrolledCourses);
router.post('/purchase', purchaseCourse);
router.post('/update-course-progress', updateCourseProgress);
router.post('/get-course-progress', getCourseProgress);
router.post('/add-rating', addCourseRating);
router.post("/add-comment", addCourseComment);


export default router;