import React, { useState } from "react";
import type { DocumentSlot } from "../../types/driver";
import { FileUploader } from "./FileUploader";

export interface VehicleDetailsForm {
    vehicleType: string;
    brand: string;
    model: string;
    color: string;
    registrationNumber: string;
    registrationState: string;
    manufactureYear: string;
    fuelType: string;
}

export interface VehicleUploadResult {
    vehicleUrl: string;
    rcPdfUrl: string;
    pollutionPdfUrl?: string;
}

const VEHICLE_DOC_SLOTS: DocumentSlot[] = [
    {
        key: "vehicle_photo",
        label: "Vehicle photo",
        hint: "Clear photo of your vehicle — JPG or PNG, up to 5MB",
        required: true,
        accept: "image/*",
        maxSizeMb: 5,
    },
    {
        key: "rc_book",
        label: "Registration certificate (RC)",
        hint: "JPG, PNG or PDF, up to 5MB",
        required: true,
        accept: "image/*,.pdf",
        maxSizeMb: 5,
    },
    {
        key: "pollution_cert",
        label: "Pollution (PUC) certificate",
        hint: "JPG, PNG or PDF, up to 5MB",
        required: false,
        accept: "image/*,.pdf",
        maxSizeMb: 5,
    },
];

const inputClass =
    "w-full rounded-xl border border-[#2A2F3A] bg-[#12151C] px-3.5 py-2.5 text-[14px] text-[#F2F3F5] placeholder:text-[#5A6072] outline-none transition-colors focus:border-[#F2A93B]";
const labelClass = "mb-1.5 block text-[12px] font-semibold text-[#8B93A5]";

const VEHICLE_TYPES: { value: string; label: string }[] = [
    { value: "BIKE", label: "Bike" },
    { value: "AUTO", label: "Auto" },
    { value: "CAR", label: "Car" },
    { value: "SUV", label: "SUV" },
];

const FUEL_TYPES: { value: string; label: string }[] = [
    { value: "PETROL", label: "Petrol" },
    { value: "DIESEL", label: "Diesel" },
    { value: "EV", label: "Electric" },
    { value: "CNG", label: "CNG" },
];

export interface VehicleDetailsProps {
    onBack?: () => void;
    onContinue?: (form: VehicleDetailsForm, files: VehicleUploadResult) => void;
    onUploadFile?: (file: File, slotKey: string) => Promise<string>; // returns S3 key
    submitting?: boolean;
}

export const VehicleDetails: React.FC<VehicleDetailsProps> = ({
    onBack,
    onContinue,
    onUploadFile,
    submitting,
}) => {
    const [form, setForm] = useState<VehicleDetailsForm>({
        vehicleType: "",
        brand: "",
        model: "",
        color: "",
        registrationNumber: "",
        registrationState: "",
        manufactureYear: "",
        fuelType: "",
    });
    const [docs, setDocs] = useState<DocumentSlot[]>(VEHICLE_DOC_SLOTS);

    const [vehicleUrl, setVehicleUrl] = useState<string | null>(null);
    const [rcPdfUrl, setRcPdfUrl] = useState<string | null>(null);
    const [pollutionPdfUrl, setPollutionPdfUrl] = useState<string | null>(null);

    const set = <K extends keyof VehicleDetailsForm>(key: K, value: VehicleDetailsForm[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const formValid =
        form.vehicleType !== "" &&
        form.brand.trim() !== "" &&
        form.model.trim() !== "" &&
        form.color.trim() !== "" &&
        form.registrationNumber.trim() !== "" &&
        form.registrationState.trim() !== "" &&
        /^\d{4}$/.test(form.manufactureYear) &&
        form.fuelType !== "";

    const docsValid = docs
        .filter((d) => d.required)
        .every((d) => d.file?.status === "verified");

    const filesReady = !!vehicleUrl && !!rcPdfUrl;

    const canContinue = formValid && docsValid && filesReady && !submitting;

    const handleUploadFile = async (file: File, slotKey: string) => {
        if (!onUploadFile) return;
        const key = await onUploadFile(file, slotKey);

        if (slotKey === "vehicle_photo") setVehicleUrl(key);
        else if (slotKey === "rc_book") setRcPdfUrl(key);
        else if (slotKey === "pollution_cert") setPollutionPdfUrl(key);
    };

    const handleContinue = () => {
        if (!canContinue || !vehicleUrl || !rcPdfUrl) return;
        onContinue?.(form, {
            vehicleUrl,
            rcPdfUrl,
            pollutionPdfUrl: pollutionPdfUrl ?? undefined,
        });
    };

    return (
        <section className="mx-auto w-full max-w-3xl">
            <header className="mb-8">
                <div className="flex items-center justify-between">
                    <span className='font-["IBM_Plex_Mono",monospace] text-xs font-semibold uppercase tracking-[0.18em] text-[#F2A93B]'>
                        Step 3 of 3
                    </span>
                    <span className="text-xs font-medium text-[#8B93A5]">
                        Vehicle Information
                    </span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#2A2F3A]">
                    <div className="h-full w-full rounded-full bg-[#F2A93B]" />
                </div>

                <h2 className='mt-6 font-["Space_Grotesk",sans-serif] text-3xl font-bold text-[#F2F3F5]'>
                    Vehicle Details
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#8B93A5]">
                    Enter your vehicle information exactly as it appears on your
                    Registration Certificate (RC).
                </p>
            </header>

            <div className="rounded-2xl border border-[#2A2F3A] bg-[#1A1E27] p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Vehicle Type</label>
                        <select
                            className={inputClass}
                            value={form.vehicleType}
                            onChange={(e) => set("vehicleType", e.target.value)}
                        >
                            <option value="" disabled>Select vehicle type</option>
                            {VEHICLE_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Fuel Type</label>
                        <select
                            className={inputClass}
                            value={form.fuelType}
                            onChange={(e) => set("fuelType", e.target.value)}
                        >
                            <option value="" disabled>Select fuel type</option>
                            {FUEL_TYPES.map((f) => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Brand</label>
                        <input
                            className={inputClass}
                            placeholder="Honda"
                            value={form.brand}
                            onChange={(e) => set("brand", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Model</label>
                        <input
                            className={inputClass}
                            placeholder="Activa 6G"
                            value={form.model}
                            onChange={(e) => set("model", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Manufacturing Year</label>
                        <input
                            className={inputClass}
                            placeholder="2023"
                            inputMode="numeric"
                            maxLength={4}
                            value={form.manufactureYear}
                            onChange={(e) => set("manufactureYear", e.target.value.replace(/\D/g, ""))}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Color</label>
                        <input
                            className={inputClass}
                            placeholder="White"
                            value={form.color}
                            onChange={(e) => set("color", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Registration Number</label>
                        <input
                            className={`${inputClass} font-["IBM_Plex_Mono",monospace] uppercase tracking-widest`}
                            placeholder="HR51AB1234"
                            value={form.registrationNumber}
                            onChange={(e) => set("registrationNumber", e.target.value.toUpperCase())}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Registration State</label>
                        <input
                            className={inputClass}
                            placeholder="e.g. Punjab"
                            value={form.registrationState}
                            onChange={(e) => set("registrationState", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <FileUploader
                    title="Vehicle Documents"
                    subtitle="Upload a photo of your vehicle, RC, and PUC (optional)."
                    slots={docs}
                    onFilesChange={setDocs}
                    onUploadFile={handleUploadFile}
                />
            </div>

            <div className="mt-10 border-t border-[#2A2F3A] pt-6">
                <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={submitting}
                        className="flex h-12 items-center justify-center rounded-xl border border-[#2A2F3A] px-6 text-sm font-semibold text-[#B7BFCC] transition-all hover:border-[#3A404E] hover:bg-[#20252F] hover:text-white disabled:opacity-50"
                    >
                        ← Back
                    </button>

                    <button
                        type="button"
                        disabled={!canContinue}
                        onClick={handleContinue}
                        className={[
                            "flex h-12 min-w-[230px] items-center justify-center rounded-xl px-8 text-sm font-bold transition-all duration-200",
                            canContinue
                                ? "bg-[#F2A93B] text-[#12151C] shadow-lg shadow-[#F2A93B]/20 hover:-translate-y-0.5 hover:brightness-110"
                                : "cursor-not-allowed bg-[#2A2F3A] text-[#8B93A5]",
                        ].join(" ")}
                    >
                        {submitting ? "Submitting..." : "Complete Registration →"}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default VehicleDetails;