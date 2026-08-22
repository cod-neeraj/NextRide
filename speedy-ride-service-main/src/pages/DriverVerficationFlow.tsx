import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppCard } from "@/components/ui/AppCard";
import { Stepper } from "@/components/driver/Stepper";
import { AddressDetails, type AddressDetailsForm } from "@/components/driver/AddressDetails";
import { BankDetails, type BankDetailsForm, type BankUploadResult } from "@/components/driver/BankDetails";
import { VehicleDetails, type VehicleDetailsForm, type VehicleUploadResult } from "@/components/driver/VehicleDetails";
import { driverApi } from "@/services/instances";
import { IdentityDocForm, IdentityDocuments, IdentityDocUploadResult } from "@/components/driver/PersonalDocuments";

const STEPS = ["Documents", "Address", "Bank Details", "Vehicle Details"];

export function DriverVerificationFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([false, false, false, false]);
  const [submitting, setSubmitting] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const uploadFile = async (file: File, slotKey: string): Promise<string> => {
    const { data: apiResponse } = await driverApi.post("/documents/upload-url", {
      docType: slotKey,
      fileName: file.name,
      contentType: file.type,
    });

    const { uploadUrl, key } = apiResponse.data;

    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    return key;
  };

  const markComplete = (index: number) => {
    setCompletedSteps((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };


  // ---- Step 0: Address ----
  const handleAddressContinue = async (form: AddressDetailsForm, photoKey: string) => {
    setSubmitting(true);
    try {
      console.log("Submitting address details:", form, "with photoKey:", photoKey);
      await driverApi.post("/documents/address/upload", {
        street: form.street,
        city: form.city,
        state: form.state,
        pdfKey: photoKey,
      });
      markComplete(1);
      setCurrentStep(2);
    } catch {
      toast.error("Couldn't save address details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBankContinue = async (form: BankDetailsForm, files: BankUploadResult) => {
    setSubmitting(true);
    try {
      await driverApi.post("/documents/bankDetails", {
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        bankName: form.bankName,
        passbookUrl: files.passbookUrl,
        fileName: files.fileName,
        chequeUrl: files.chequeUrl,
        chequefileName: files.chequefileName,
        issuedDate: form.issuedDate,
      });
      markComplete(2);
      setCurrentStep(3);
    } catch {
      toast.error("Couldn't save bank details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleIdentityContinue = async (form: IdentityDocForm, files: IdentityDocUploadResult) => {
    setSubmitting(true);
    try {
      await driverApi.post("/documents/personal", {
        aadhaarNumber: form.aadhaarNumber,
        aadhaarIssuedDate: form.aadhaarIssuedDate,
        aadhaarPhotoKey: files.aadhaarPhotoKey,
        panNumber: form.panNumber,
        panIssuedDate: form.panIssuedDate,
        panPhotoKey: files.panPhotoKey,
        voterIdNumber: form.voterIdNumber,
        voterIdIssuedDate: form.voterIdIssuedDate,
        voterIdPhotoKey: files.voterIdPhotoKey,
      });
      markComplete(0);
      setCurrentStep(1);
    } catch {
      toast.error("Couldn't save your documents. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleVehicleContinue = async (form: VehicleDetailsForm, files: VehicleUploadResult) => {
    setSubmitting(true);
    try {

      console.log("Submitting vehicle details:", form, "with files:", files);
      await driverApi.post("/driver/vehicle/register", {
        vehicleType: form.vehicleType,
        brand: form.brand,
        model: form.model,
        color: form.color,
        registrationNumber: form.registrationNumber,
        registrationState: form.registrationState,
        manufactureYear: Number(form.manufactureYear),
        fuelType: form.fuelType,
        vehicleUrl: files.vehicleUrl,
        rcPdfUrl: files.rcPdfUrl,
        pollutionPdfUrl: files.pollutionPdfUrl,
      });
      markComplete(3);
      setAllDone(true);
    } catch {
      toast.error("Couldn't save vehicle details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => setCurrentStep((s) => Math.max(0, s - 1));

  if (allDone) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <AppCard className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <ShieldCheck className="h-6 w-6 text-success" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              You're all set — under review
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              We've received your documents and details. Our team will verify
              them shortly — this usually takes 24-48 hours. We'll notify you
              once your account is approved.
            </p>
            <button
              className="mt-5 text-sm font-medium text-primary underline underline-offset-2"
              onClick={() => navigate("/driver/home")}
            >
              Back to dashboard
            </button>
          </AppCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Complete your profile</h1>
          <p className="text-sm text-muted-foreground">
            Finish these steps to get verified and start accepting rides.
          </p>
        </div>

        <Stepper steps={STEPS} currentStep={currentStep} completedSteps={completedSteps} />

        <div className="mt-6">
          {currentStep === 1 && (
            <AddressDetails
              onContinue={handleAddressContinue}
              onUploadFile={uploadFile}
              submitting={submitting}
            />
          )}
          {currentStep === 0 && (
            <IdentityDocuments
              onContinue={handleIdentityContinue}
              onUploadFile={uploadFile}
              submitting={submitting}
            />
          )}
          {currentStep === 2 && (
            <BankDetails
              onSubmit={handleBankContinue}
              onUploadFile={uploadFile}
              onBack={goBack}
              submitting={submitting}
            />
          )}
          {currentStep === 3 && (
            <VehicleDetails
              onContinue={handleVehicleContinue}
              onUploadFile={uploadFile}
              onBack={goBack}
              submitting={submitting}
            />
          )}
        </div>
      </main>
    </div>
  );
}