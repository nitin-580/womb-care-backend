import { UserRepository } from '../repositories/userRepository';
import { CreateUserInput } from '../database/interfaces';
import { sendConfirmationEmail } from '../workers/emailWorker';
import { logger } from '../utils/logger';

export class EarlyAccessService {
  constructor(private userRepository: UserRepository) {}

  async registerUser(userData: CreateUserInput) {
    // 1. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error('Email is already registered for early access');
      (error as any).status = 409; // Conflict
      throw error;
    }

    // 2. Persist user to database
    const user = await this.userRepository.create(userData);

    // 3. Trigger confirmation email asynchronously (do not await)
    sendConfirmationEmail(user.name, user.email).catch((err) => {
      logger.error(`Failed to send background email to ${user.email}:`, err);
    });

    return user;
  }
}
