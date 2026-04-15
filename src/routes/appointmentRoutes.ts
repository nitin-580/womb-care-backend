import { Router } from 'express';
import { AppointmentController, scheduleAppointmentSchema } from '../controllers/appointmentController';
import { AppointmentService } from '../services/appointmentService';
import { AppointmentRepository } from '../repositories/appointmentRepository';
import { SupabaseAdapter } from '../database/supabaseAdapter';
import { validate } from '../middleware/validate';

const router = Router();
const dbAdapter = new SupabaseAdapter();
const repository = new AppointmentRepository(dbAdapter);
const service = new AppointmentService(repository);
const controller = new AppointmentController(service);

router.post('/', validate(scheduleAppointmentSchema), controller.schedule);
router.get('/user/:userId', controller.getByUser);
router.patch('/:id/cancel', controller.cancel);

export default router;
