import { Router } from 'express';
import { DoctorController } from '../controllers/doctorController';
import { DoctorRepository } from '../repositories/doctorRepository';
import { PatientRepository } from '../repositories/patientRepository';
import { SupabaseAdapter } from '../database/supabaseAdapter';
import { doctorAuth } from '../middleware/doctorAuth';

const router = Router();

// Dependency Injection Setup
const dbAdapter = new SupabaseAdapter();
const doctorRepo = new DoctorRepository(dbAdapter);
const patientRepo = new PatientRepository(dbAdapter);
const doctorController = new DoctorController(doctorRepo, patientRepo);

// Public Routes
router.post('/signup', doctorController.signupDoctor);
router.post('/login', doctorController.loginDoctor);
router.get('/role-check', doctorController.roleCheck);

// Private Routes
router.get('/profile', doctorAuth, doctorController.getDoctorProfile);
router.put('/profile', doctorAuth, doctorController.updateDoctorProfile);
router.get('/patients', doctorAuth, doctorController.getDoctorPatients);

// Doctor Join Requests
router.post('/join-request', doctorController.createJoinRequest);
router.get('/admin/join-requests', doctorController.getJoinRequests);
router.patch('/admin/join-requests', doctorController.updateJoinRequestStatus);

export default router;
