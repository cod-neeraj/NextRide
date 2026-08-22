// AddressDetails.tsx
// Step 1: profile photo + address details.

import React, { useState } from "react";
import { FileUploader } from "./FileUploader";
import { DocumentSlot } from "@/types/driver";

export interface AddressDetailsForm {
  street: string;
  city: string;
  state: string;
}

const PROFILE_PHOTO_SLOT: DocumentSlot[] = [
    {
        key: "profile_photo",
        label: "Profile photo",
        hint: "A clear, recent selfie — JPG or PNG, up to 5MB",
        required: true,
        accept: "image/*",
        maxSizeMb: 5,
    },
];

const inputClass =
    "w-full rounded-xl border border-[#2A2F3A] bg-[#12151C] px-3.5 py-2.5 text-[14px] text-[#F2F3F5] placeholder:text-[#5A6072] outline-none transition-colors focus:border-[#F2A93B]";
const labelClass = "mb-1.5 block text-[12px] font-semibold text-[#8B93A5]";

export interface AddressDetailsProps {
    // now returns the profile photo key too, alongside form + docs
    onContinue?: (form: AddressDetailsForm, photoKey: string) => void;
    onUploadFile?: (file: File, slotKey: string) => Promise<string>; // returns the S3 key
    submitting?: boolean;
}

export const AddressDetails: React.FC<AddressDetailsProps> = ({
    onContinue,
    onUploadFile,
    submitting,
}) => {
    const [form, setForm] = useState<AddressDetailsForm>({
        street: "",
        city: "",
        state: "",
    });
    const [docs, setDocs] = useState<DocumentSlot[]>(PROFILE_PHOTO_SLOT);
    const [photoKey, setPhotoKey] = useState<string | null>(null);

    const set = <K extends keyof AddressDetailsForm>(key: K, value: AddressDetailsForm[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const formValid =
        form.street.trim() !== "" &&
        form.city.trim() !== "" &&
        form.state.trim() !== "";

    const docsValid = docs
        .filter((d) => d.required)
        .every((d) => d.file?.status === "verified");

    const canContinue = formValid && docsValid && !!photoKey && !submitting;

    // wraps onUploadFile so we can capture the returned key
    const handleUploadFile = async (file: File, slotKey: string) => {
        if (!onUploadFile) return;
        const key = await onUploadFile(file, slotKey);
        setPhotoKey(key);
    };
    console.log({ formValid, docsValid, photoKey, canContinue, docs });

    return (
        <section className="mx-auto w-full max-w-2xl">
            <header className="mb-8">
                <div className="flex items-center justify-between">
                    <span className='font-["IBM_Plex_Mono",monospace] text-xs font-semibold uppercase tracking-[0.18em] text-[#F2A93B]'>
                        Step 1 of 4
                    </span>
                    <span className="text-xs font-medium text-[#8B93A5]">
                        Address Details
                    </span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#2A2F3A]">
                    <div className="h-full w-1/3 rounded-full bg-[#F2A93B]" />
                </div>

                <h2 className='mt-6 font-["Space_Grotesk",sans-serif] text-3xl font-bold text-[#F2F3F5]'>
                    Your Address
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#8B93A5]">
                    Add a clear profile photo and your current residential address.
                </p>
            </header>

            {/* Profile photo upload */}
            <FileUploader
                title="Profile Photo"
                slots={docs}
                onFilesChange={setDocs}
                onUploadFile={handleUploadFile}
            />

            {/* Address fields */}
            <div className="mt-8 rounded-2xl border border-[#2A2F3A] bg-[#1A1E27] p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Street address</label>
                        <input
                            className={inputClass}
                            placeholder="House no, street, area"
                            value={form.street}
                            onChange={(e) => set("street", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>City</label>
                        <input
                            className={inputClass}
                            placeholder="e.g. Ludhiana"
                            value={form.city}
                            onChange={(e) => set("city", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>State</label>
                        <input
                            className={inputClass}
                            placeholder="e.g. Punjab"
                            value={form.state}
                            onChange={(e) => set("state", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-10 border-t border-[#2A2F3A] pt-6">
                <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-end">
                    <button
                        type="button"
                        disabled={!canContinue}
                        onClick={() => photoKey && onContinue?.(form, photoKey)}
                        className={[
                            "flex h-12 min-w-[220px] items-center justify-center rounded-xl px-8 text-sm font-bold transition-all duration-200",
                            canContinue
                                ? "bg-[#F2A93B] text-[#12151C] shadow-lg shadow-[#F2A93B]/20 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
                                : "cursor-not-allowed bg-[#2A2F3A] text-[#8B93A5]",
                        ].join(" ")}
                    >
                        {submitting ? "Saving..." : "Continue to Bank Details →"}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AddressDetails;