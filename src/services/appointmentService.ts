import { AppointmentRepository } from '../repositories/appointmentRepository';
import { CreateAppointmentInput, Appointment } from '../database/interfaces';
import { logger } from '../utils/logger';

export class AppointmentService {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async scheduleAppointment(data: CreateAppointmentInput): Promise<Appointment> {
    const appointment = await this.appointmentRepository.create(data);
    logger.info(`Appointment scheduled for user ${data.userId} with ${data.doctorName}`);
    return appointment;
  }

  async getUserAppointments(userId: string): Promise<Appointment[]> {
    return this.appointmentRepository.getByUserId(userId);
  }

  async cancelAppointment(id: string): Promise<Appointment> {
    return this.appointmentRepository.updateStatus(id, 'cancelled');
  }
}
