import express from 'express';

import { updateRoleToEducator, addCourse } from '../controllers/educator.controller.js';
import upload from '../middlewares/multer.js';
import { protectEducator } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/update-role', updateRoleToEducator);
router.post('/add-course', upload.single('image'), protectEducator, addCourse);

export default router;