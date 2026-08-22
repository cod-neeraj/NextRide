import React, { useState } from "react";
import { FileUploader } from "./FileUploader";
import type { DocumentSlot } from "../../types/driver";

export interface BankDetailsForm {
  accountNumber: string;
  confirmAccountNumber: string; 
  ifscCode: string;
  bankName: string;
  issuedDate: string;
}

const BANK_DOC_SLOTS: DocumentSlot[] = [
    {
        key: "passbook",
        label: "Passbook photo",
        hint: "Must clearly show account number & IFSC — JPG, PNG or PDF",
        required: true,
        accept: "image/*,.pdf",
        maxSizeMb: 5,
    },
    {
        key: "cheque",
        label: "Cancelled cheque",
        hint: "JPG, PNG or PDF, up to 5MB",
        required: true,
        accept: "image/*,.pdf",
        maxSizeMb: 5,
    },
];

const inputClass =
    "w-full rounded-xl border border-[#2A2F3A] bg-[#12151C] px-3.5 py-2.5 text-[14px] text-[#F2F3F5] placeholder:text-[#5A6072] outline-none transition-colors focus:border-[#F2A93B]";
const labelClass = "mb-1.5 block text-[12px] font-semibold text-[#8B93A5]";
const errorClass = "mt-1 text-[12px] text-[#F2545B]";

export interface BankUploadResult {
  passbookUrl: string;
  fileName: string;
  chequeUrl: string;
  chequefileName: string;
}

export interface BankDetailsProps {
    onBack?: () => void;
    onSubmit?: (form: BankDetailsForm, files: BankUploadResult) => void;
    onUploadFile?: (file: File, slotKey: string) => Promise<string>; // returns S3 key
    submitting?: boolean;
}

export const BankDetails: React.FC<BankDetailsProps> = ({
    onBack,
    onSubmit,
    onUploadFile,
    submitting,
}) => {
    const [form, setForm] = useState<BankDetailsForm>({
        accountNumber: "",
        confirmAccountNumber: "",
        ifscCode: "",
        bankName: "",
        issuedDate: "",
    });
    const [docs, setDocs] = useState<DocumentSlot[]>(BANK_DOC_SLOTS);

    const [passbookUrl, setPassbookUrl] = useState<string | null>(null);
    const [passbookFileName, setPassbookFileName] = useState<string | null>(null);
    const [chequeUrl, setChequeUrl] = useState<string | null>(null);
    const [chequeFileName, setChequeFileName] = useState<string | null>(null);

    const [touched, setTouched] = useState(false);

    const set = <K extends keyof BankDetailsForm>(key: K, value: BankDetailsForm[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const accountsMatch =
        form.accountNumber !== "" && form.accountNumber === form.confirmAccountNumber;
    const ifscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode);

    const formValid =
        accountsMatch &&
        ifscValid &&
        form.bankName.trim() !== "" &&
        form.issuedDate !== "";

    const docsValid = docs
        .filter((d) => d.required)
        .every((d) => d.file?.status === "verified");

    const filesReady = !!passbookUrl && !!chequeUrl;

    const canSubmit = formValid && docsValid && filesReady && !submitting;

    // captures the returned key per slot (passbook vs cheque)
    const handleUploadFile = async (file: File, slotKey: string) => {
        if (!onUploadFile) return;
        const key = await onUploadFile(file, slotKey);

        if (slotKey === "passbook") {
            setPassbookUrl(key);
            setPassbookFileName(file.name);
        } else if (slotKey === "cheque") {
            setChequeUrl(key);
            setChequeFileName(file.name);
        }
    };

    const handleSubmit = () => {
        setTouched(true);
        if (canSubmit && passbookUrl && passbookFileName && chequeUrl && chequeFileName) {
            onSubmit?.(form, {
                passbookUrl,
                fileName: passbookFileName,
                chequeUrl,
                chequefileName: chequeFileName,
            });
        }
    };
console.log({
  formValid,
  docsValid,
  filesReady,
  canSubmit,
  passbookUrl,
  chequeUrl,
  accountsMatch,
  ifscValid,
  issuedDate: form.issuedDate,
});
    return (
        <>
            <section className="mx-auto w-full max-w-2xl">
                <header className="mb-8">
                    <div>
                        <p className="font-['IBM_Plex_Mono',monospace] text-xs font-semibold uppercase tracking-[0.2em] text-[#F2A93B]">
                            Step 3 of 4
                        </p>
                        <h2 className="mt-2 font-['Space_Grotesk',sans-serif] text-3xl font-bold text-white">
                            Bank Details
                        </h2>
                        <p className="mt-2 max-w-lg text-sm leading-6 text-[#8B93A5]">
                            Add your bank account where your weekly earnings will be transferred.
                        </p>
                    </div>

                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#2A2F3A]">
                        <div className="h-full w-3/4 rounded-full bg-[#F2A93B] transition-all duration-500" />
                    </div>
                </header>

                <div className="rounded-2xl border border-[#2A2F3A] bg-[#1A1E27] p-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Account number</label>
                            <input
                                className={`${inputClass} font-["IBM_Plex_Mono",monospace]`}
                                inputMode="numeric"
                                value={form.accountNumber}
                                onChange={(e) => set("accountNumber", e.target.value.replace(/\D/g, ""))}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Confirm account number</label>
                            <input
                                className={`${inputClass} font-["IBM_Plex_Mono",monospace]`}
                                inputMode="numeric"
                                value={form.confirmAccountNumber}
                                onChange={(e) =>
                                    set("confirmAccountNumber", e.target.value.replace(/\D/g, ""))
                                }
                            />
                            {touched && form.confirmAccountNumber !== "" && !accountsMatch && (
                                <p className={errorClass}>Account numbers don't match</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>IFSC code</label>
                            <input
                                className={`${inputClass} uppercase font-["IBM_Plex_Mono",monospace]`}
                                placeholder="e.g. HDFC0001234"
                                maxLength={11}
                                value={form.ifscCode}
                                onChange={(e) => set("ifscCode", e.target.value.toUpperCase())}
                            />
                            {touched && form.ifscCode !== "" && !ifscValid && (
                                <p className={errorClass}>Enter a valid IFSC code</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Bank name</label>
                            <input
                                className={inputClass}
                                placeholder="e.g. HDFC Bank"
                                value={form.bankName}
                                onChange={(e) => set("bankName", e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>Issued date</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={form.issuedDate}
                                onChange={(e) => set("issuedDate", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <FileUploader
                        slots={docs}
                        onFilesChange={setDocs}
                        onUploadFile={handleUploadFile}
                    />
                </div>

                <div className="mt-10 border-t border-[#2A2F3A] pt-6">
                    <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#2A2F3A] bg-[#1A1E27] px-4 py-3">
                        <span className="text-lg">🔒</span>
                        <p className="text-sm text-[#8B93A5]">
                            Your bank details are encrypted and securely stored.
                        </p>
                    </div>

                    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={submitting}
                            className="flex h-12 items-center justify-center rounded-xl border border-[#2A2F3A] bg-transparent px-6 text-sm font-semibold text-[#B7BFCC] transition-all duration-200 hover:border-[#3A404E] hover:bg-[#1E232D] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            ← Back
                        </button>

                        <button
                            type="button"
                            disabled={!canSubmit}
                            onClick={handleSubmit}
                            className={[
                                "flex h-12 min-w-[220px] items-center justify-center rounded-xl px-8 text-sm font-bold transition-all duration-200",
                                canSubmit
                                    ? "bg-[#F2A93B] text-[#12151C] shadow-lg shadow-[#F2A93B]/20 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
                                    : "cursor-not-allowed bg-[#2A2F3A] text-[#8B93A5]",
                            ].join(" ")}
                        >
                            {submitting ? "Submitting..." : "Continue to Vehicle Details →"}
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default BankDetails;