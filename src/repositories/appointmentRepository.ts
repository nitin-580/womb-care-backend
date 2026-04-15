import { DatabaseAdapter, CreateAppointmentInput, Appointment } from '../database/interfaces';

export class AppointmentRepository {
  constructor(private dbAdapter: DatabaseAdapter) {}

  async create(appointment: CreateAppointmentInput): Promise<Appointment> {
    return this.dbAdapter.createAppointment(appointment);
  }

  async getByUserId(userId: string): Promise<Appointment[]> {
    return this.dbAdapter.getAppointmentsByUser(userId);
  }

  async updateStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    return this.dbAdapter.updateAppointmentStatus(id, status);
  }
}
