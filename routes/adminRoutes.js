import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import AdminController from '../controllers/adminController.js';

const router = Router();

// Protect all admin routes with authentication and admin role authorization
router.use(authenticate, authorize(['admin']));

// Get users (with search + pagination)
router.get('/users', AdminController.getUsers);

// Create user
router.post('/users', AdminController.createUser);

// Update user role
router.patch('/users/:id/role', AdminController.updateUserRole);

// Delete user (soft delete)
router.delete('/users/:id', AdminController.deleteUser);


//admin dashbourd summary
router.get('/dashboard/summary', AdminController.getDashboardSummary);

// Course popularity report
router.get('/reports/course-popularity', AdminController.getCoursePopularity);



export default router;
