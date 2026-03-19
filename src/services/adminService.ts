import { UserRepository } from '../repositories/userRepository';

export class AdminService {
  constructor(private userRepository: UserRepository) {}

  async getStats() {
    return this.userRepository.getRegistrationStats();
  }

  async getUsers(page: number, limit: number) {
    return this.userRepository.getPaginatedUsers(page, limit);
  }
}
