import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { AdminService } from '../services/adminService';
import { UserRepository } from '../repositories/userRepository';
import { SupabaseAdapter } from '../database/supabaseAdapter';
import { adminAuth } from '../middleware/adminAuth';
import { BlogController } from '../controllers/blogController';
import { BlogService } from '../services/blogService';
import { BlogRepository } from '../repositories/blogRepository';

const router = Router();

// Dependency Injection Setup
const dbAdapter = new SupabaseAdapter();
const userRepository = new UserRepository(dbAdapter);
const adminService = new AdminService(userRepository);
const adminController = new AdminController(adminService);

const blogRepository = new BlogRepository(dbAdapter);
const blogService = new BlogService(blogRepository);
const blogController = new BlogController(blogService);

// Apply admin authentication middleware to all admin routes
router.use(adminAuth);

// Admin stats and users
router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);

// Admin blog CRUD
router.get('/blogs', blogController.getBlogs);
router.get('/blogs/:id', blogController.getBlog);
router.post('/blogs', blogController.createBlog);
router.patch('/blogs/:id', blogController.updateBlog);
router.delete('/blogs/:id', blogController.deleteBlog);

export default router;
