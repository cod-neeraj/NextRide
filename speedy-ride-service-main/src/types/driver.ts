// types.ts
// Shared types for the driver onboarding flow.
// Wire these up to your real API contracts — nothing here talks to a backend.

export type UploadStatus = "idle" | "uploading" | "verifying" | "verified" | "error";

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl?: string;
  status: "idle" | "uploading" | "verifying" | "verified" | "error";
  progress: number;
  errorMessage?: string;
}

export interface DocumentSlot {
  key: string; 
  label: string;
  hint: string;
  required: boolean;
  accept: string; 
  maxSizeMb: number;
  file?: UploadedFile;
}

export interface StepDefinition {
  key: string;
  label: string;
  description?: string;
}

export interface BankDetailsForm {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
}

export interface VehicleDetailsForm {
  vehicleType: "two_wheeler" | "three_wheeler" | "four_wheeler" | "";
  make: string;
  model: string;
  year: string;
  registrationNumber: string;
  color: string;
}