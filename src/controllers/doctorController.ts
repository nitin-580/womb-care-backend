import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DoctorRepository } from "../repositories/doctorRepository";
import { PatientRepository } from "../repositories/patientRepository";
import { env } from "../config/env";
import { CreateDoctorInput, UpdateDoctorInput } from "../database/interfaces";
import { sendWelcomeMail } from "../lib/sendWelcomeMail";

export class DoctorController {
  constructor(
    private doctorRepo: DoctorRepository,
    private patientRepo: PatientRepository
  ) {}

  /**
   * Register Doctor
   * POST /api/doctors/signup
   */
  signupDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        email,
        password,
        phone,
        specialization,
        credentials,
        profilePicture,
      } = req.body;

      const existingDoctor = await this.doctorRepo.findByEmail(email);

      if (existingDoctor) {
        res.status(400).json({
          success: false,
          message: "Doctor already exists",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const referralCode =
        "DOC" + Math.floor(100000 + Math.random() * 900000);

      const doctorData: CreateDoctorInput = {
        name,
        email,
        password: hashedPassword,
        phone,
        specialization,
        credentials,
        profilePicture,
        referralCode,
      };

      const doctor = await this.doctorRepo.create(doctorData);

      // Trigger welcome email asynchronously
      sendWelcomeMail(doctor.email, doctor.name).catch((err) => {
        console.error(`Failed to send welcome email to doctor ${doctor.email}:`, err);
      });

      // Remove password from response
      const { password: _, ...doctorResponse } = doctor as any;

      res.status(201).json({
        success: true,
        message: "Doctor registered successfully",
        doctor: doctorResponse,
      });
    } catch (error: any) {
      console.error("Doctor signup error:", error);

      res.status(500).json({
        success: false,
        message: error.message || "Doctor signup failed",
      });
    }
  };

  /**
   * Doctor Login
   * POST /api/doctors/login
   */
  loginDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const doctor = await this.doctorRepo.findByEmail(email);

      if (!doctor || !doctor.password) {
        res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
        return;
      }

      const isValidPassword = await bcrypt.compare(
        password,
        doctor.password
      );

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      const token = jwt.sign(
        {
          id: doctor.id,
          email: doctor.email,
          role: "doctor",
        },
        env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      // Remove password from response
      const { password: _, ...doctorResponse } = doctor as any;

      res.status(200).json({
        success: true,
        token,
        doctor: doctorResponse,
      });
    } catch (error: any) {
      console.error("Doctor login error:", error);

      res.status(500).json({
        success: false,
        message: error.message || "Login failed",
      });
    }
  };

  /**
   * Get Logged In Doctor Profile
   * GET /api/doctors/profile
   */
  getDoctorProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const doctorId = req.user?.id;

      if (!doctorId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const doctor = await this.doctorRepo.findById(doctorId);

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
        return;
      }

      const patients = await this.patientRepo.findByDoctor(doctorId);

      // Remove password from response
      const { password: _, ...doctorResponse } = doctor as any;

      res.status(200).json({
        success: true,
        doctor: doctorResponse,
        totalPatients: patients.length,
        referredPatients: patients,
      });
    } catch (error: any) {
      console.error("Fetch profile error:", error);

      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch profile",
      });
    }
  };

  /**
   * Update Doctor Profile
   * PUT /api/doctors/profile
   */
  updateDoctorProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const doctorId = req.user?.id;

      if (!doctorId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const updateData: UpdateDoctorInput = req.body;
      
      // Don't allow password update through this endpoint for safety in this simple refactor
      delete (updateData as any).password;

      const updatedDoctor = await this.doctorRepo.update(doctorId, updateData);

      if (!updatedDoctor) {
        res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
        return;
      }

      // Remove password from response
      const { password: _, ...doctorResponse } = updatedDoctor as any;

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        doctor: doctorResponse,
      });
    } catch (error: any) {
      console.error("Update profile error:", error);

      res.status(500).json({
        success: false,
        message: error.message || "Failed to update profile",
      });
    }
  };

  /**
   * Get Referred Patients
   * GET /api/doctors/patients
   */
  getDoctorPatients = async (req: Request, res: Response): Promise<void> => {
    try {
      const doctorId = req.user?.id;

      if (!doctorId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const patients = await this.patientRepo.findByDoctor(doctorId);

      res.status(200).json({
        success: true,
        total: patients.length,
        patients,
      });
    } catch (error: any) {
      console.error("Fetch patients error:", error);

      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch patients",
      });
    }
  };

  /**
   * Role Check
   * GET /api/doctors/role-check?email=...
   */
  roleCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const email = req.query.email as string;
      if (!email) {
        res.status(400).json({ success: false, message: "Email required" });
        return;
      }
      const role = await this.doctorRepo.getUserRole(email);
      res.status(200).json({ success: true, role: role || 'user' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}