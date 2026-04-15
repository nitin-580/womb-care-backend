import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointmentService';
import { z } from 'zod';

export const scheduleAppointmentSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    doctorName: z.string().min(1),
    appointmentDate: z.string().min(1), // ISO string
    notes: z.string().optional(),
  }),
});

export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  schedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appointment = await this.appointmentService.scheduleAppointment(req.body);
      res.status(201).json({
        success: true,
        message: 'Your appointment has been scheduled successfully!',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  };

  getByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appointments = await this.appointmentService.getUserAppointments(req.params.userId);
      res.status(200).json({
        success: true,
        data: appointments
      });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.appointmentService.cancelAppointment(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
