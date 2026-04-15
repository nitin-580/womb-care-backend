import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DoctorRepository } from "../repositories/doctorRepository";
import { PatientRepository } from "../repositories/patientRepository";
import { env } from "../config/env";
import { CreateDoctorInput, UpdateDoctorInput } from "../database/interfaces";
import { sendWelcomeMail } from "../lib/sendWelcomeMail";
import { sendDoctorApplicationMail, sendDoctorApprovalMail } from "../lib/sendDoctorMails";

export class DoctorController {
  constructor(
    private doctorRepo: DoctorRepository,
    private patientRepo: PatientRepository
  ) {}

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
        res.status(400).json({ success: false, message: "Doctor already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const referralCode = "DOC" + Math.floor(100000 + Math.random() * 900000);

      const doctorData: CreateDoctorInput = {
        name, email, password: hashedPassword, phone,
        specialization, credentials, profilePicture, referralCode,
      };

      const doctor = await this.doctorRepo.create(doctorData);
      sendWelcomeMail(doctor.email, doctor.name).catch(console.error);

      const { password: _, ...doctorResponse } = doctor as any;
      res.status(201).json({ success: true, message: "Doctor registered successfully", doctor: doctorResponse });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  loginDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const doctor = await this.doctorRepo.findByEmail(email);

      if (!doctor || !doctor.password) {
        res.status(404).json({ success: false, message: "Doctor not found" });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, doctor.password);
      if (!isValidPassword) {
        res.status(401).json({ success: false, message: "Invalid credentials" });
        return;
      }

      const token = jwt.sign({ id: doctor.id, email: doctor.email, role: "doctor" }, env.JWT_SECRET, { expiresIn: "7d" });
      const { password: _, ...doctorResponse } = doctor as any;
      res.status(200).json({ success: true, token, doctor: doctorResponse });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getDoctorProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const doctorId = req.user?.id;
      if (!doctorId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const doctor = await this.doctorRepo.findById(doctorId);
      if (!doctor) {
        res.status(404).json({ success: false, message: "Doctor not found" });
        return;
      }
      const patients = await this.patientRepo.findByDoctor(doctorId);
      const { password: _, ...doctorResponse } = doctor as any;
      res.status(200).json({ success: true, doctor: doctorResponse, totalPatients: patients.length, referredPatients: patients });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  updateDoctorProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const doctorId = req.user?.id;
      if (!doctorId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const updateData: UpdateDoctorInput = req.body;
      delete (updateData as any).password;
      const updatedDoctor = await this.doctorRepo.update(doctorId, updateData);
      if (!updatedDoctor) {
        res.status(404).json({ success: false, message: "Doctor not found" });
        return;
      }
      const { password: _, ...doctorResponse } = updatedDoctor as any;
      res.status(200).json({ success: true, message: "Profile updated successfully", doctor: doctorResponse });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getDoctorPatients = async (req: Request, res: Response): Promise<void> => {
    try {
      const doctorId = req.user?.id;
      if (!doctorId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const patients = await this.patientRepo.findByDoctor(doctorId);
      res.status(200).json({ success: true, total: patients.length, patients });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

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

  createJoinRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.doctorRepo.createJoinRequest(req.body);
      sendDoctorApplicationMail(data.email, data.full_name, data.medical_registration_number).catch(console.error);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getJoinRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.doctorRepo.getJoinRequests();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  updateJoinRequestStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, status } = req.body;
      const data = await this.doctorRepo.updateJoinRequestStatus(id, status);
      if (status === 'approved') {
        sendDoctorApprovalMail(data.email, data.full_name).catch(console.error);
      }
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}