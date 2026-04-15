import { UserProfileRepository } from '../repositories/userProfileRepository';
import { CreateUserProfileInput, UserProfile } from '../database/interfaces';
import { logger } from '../utils/logger';

export class UserProfileService {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async createProfile(profileData: CreateUserProfileInput): Promise<UserProfile> {
    const profile = await this.userProfileRepository.create(profileData);
    logger.info(`User profile created for: ${profile.name} (${profile.email})`);
    return profile;
  }

  async getProfile(id: string): Promise<UserProfile> {
    return this.userProfileRepository.getById(id);
  }

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = await this.userProfileRepository.update(id, updates);
    logger.info(`User profile updated for: ${profile.name} (ID: ${id})`);
    return profile;
  }
}
