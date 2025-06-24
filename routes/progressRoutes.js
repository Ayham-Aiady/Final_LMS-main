import express from 'express';
import ProgressController from '../controllers/progressController.js';
import { authenticate } from '../middleware/auth.js'; // Your auth middleware path

const router = express.Router();

// Route to mark a lesson as completed
router.post('/complete', authenticate, ProgressController.markLessonCompleted);

// Route to get progress for a specific enrollment
router.get('/:enrollmentId', authenticate, ProgressController.getProgress);

router.get('/:enrollmentId/completed-lessons', authenticate, ProgressController.getCompletedLessons);

router.get('/user/:userId/completed-lessons', authenticate, ProgressController.getCompletedLessonsByUser);



export default router;
