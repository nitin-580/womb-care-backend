
import { SupabaseAdapter } from '../src/database/supabaseAdapter';
import { UserRepository } from '../src/repositories/userRepository';
import { EarlyAccessService } from '../src/services/earlyAccessService';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testSignup() {
  const dbAdapter = new SupabaseAdapter();
  const userRepository = new UserRepository(dbAdapter);
  const earlyAccessService = new EarlyAccessService(userRepository);

  const testUser = {
    name: 'Nitin Divya',
    email: 'nitindivya15@gmail.com',
    phone: '1234567890',
    age: 25,
    weight: 70,
    cycleRegularity: 'Regular',
    symptoms: 'None',
    country: 'India',
    source: 'Direct'
  };

  try {
    console.log('Attempting to register user...');
    // We check if user exists first to avoid conflict error if run multiple times
    const existing = await userRepository.findByEmail(testUser.email);
    if (existing) {
       console.log('User already exists in DB, sending email only...');
       const { sendWelcomeMail } = require('../lib/sendWelcomeMail');
       await sendWelcomeMail(testUser.email, testUser.name);
       console.log('Email sent!');
    } else {
       const user = await earlyAccessService.registerUser(testUser);
       console.log('User registered successfully:', user);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSignup();
