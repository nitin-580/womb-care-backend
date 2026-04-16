import { Router } from 'express';
import { DoctorController } from '../controllers/doctorController';
import { DoctorRepository } from '../repositories/doctorRepository';
import { PatientRepository } from '../repositories/patientRepository';
import { UserProfileRepository } from '../repositories/userProfileRepository';
import { SupabaseAdapter } from '../database/supabaseAdapter';
import { doctorAuth } from '../middleware/doctorAuth';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Dependency Injection Setup
const dbAdapter = new SupabaseAdapter();
const doctorRepo = new DoctorRepository(dbAdapter);
const patientRepo = new PatientRepository(dbAdapter);
const profileRepo = new UserProfileRepository(dbAdapter);
const doctorController = new DoctorController(doctorRepo, patientRepo, profileRepo);

// Public Routes
router.post('/signup', doctorController.signupDoctor);
router.post('/login', doctorController.loginDoctor);
router.get('/role-check', doctorController.roleCheck);

// Private Routes
router.get('/profile', doctorAuth, doctorController.getDoctorProfile);
router.put('/profile', doctorAuth, doctorController.updateDoctorProfile);
router.get('/patients', doctorAuth, doctorController.getDoctorPatients);

// Doctor Join Requests (Admin + Public)
router.post('/join-request', doctorController.createJoinRequest);
router.get('/admin/join-requests', adminAuth, doctorController.getJoinRequests);
router.patch('/admin/join-requests', adminAuth, doctorController.updateJoinRequestStatus);

export default router;
