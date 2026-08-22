// components/driver/IdentityDocuments.tsx
import React, { useState } from "react";

export interface IdentityDocForm {
  aadhaarNumber: string;
  aadhaarIssuedDate: string;
  panNumber: string;
  panIssuedDate: string;
  voterIdNumber: string;
  voterIdIssuedDate: string;
}

export interface IdentityDocUploadResult {
  aadhaarPhotoKey?: string;
  panPhotoKey?: string;
  voterIdPhotoKey?: string;
}

type DocFileKey = keyof IdentityDocUploadResult;

interface DocCardProps {
  title: string;
  hint: string;
  numberLabel: string;
  numberValue: string;
  onNumberChange: (v: string) => void;
  issuedDate: string;
  onIssuedDateChange: (v: string) => void;
  photoKey?: string;
  onUploadPhoto: (file: File) => void;
  uploading: boolean;
}

const DocCard: React.FC<DocCardProps> = ({
  title,
  hint,
  numberLabel,
  numberValue,
  onNumberChange,
  issuedDate,
  onIssuedDateChange,
  photoKey,
  onUploadPhoto,
  uploading,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-[#2A2F3A] bg-[#1A1E27] p-5">
      <h3 className='font-["Space_Grotesk",sans-serif] text-[15px] font-bold text-[#F2F3F5]'>
        {title}
      </h3>
      <p className="mt-1 text-xs text-[#8B93A5]">{hint}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-[#8B93A5]">
            {numberLabel}
          </label>
          <input
            type="text"
            value={numberValue}
            onChange={(e) => onNumberChange(e.target.value)}
            placeholder={`Enter ${numberLabel.toLowerCase()}`}
            className="mt-1 w-full rounded-lg border border-[#2A2F3A] bg-[#12151C] px-3 py-2 text-sm text-[#F2F3F5] outline-none focus:border-[#F2A93B]"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#8B93A5]">
            Issued Date
          </label>
          <input
            type="date"
            value={issuedDate}
            onChange={(e) => onIssuedDateChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#2A2F3A] bg-[#12151C] px-3 py-2 text-sm text-[#F2F3F5] outline-none focus:border-[#F2A93B] [color-scheme:dark]"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-[#8B93A5]">Photo</label>
        <div className="mt-1 flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-[#2A2F3A] px-3 py-2 text-xs font-semibold text-[#F2F3F5] transition-all hover:border-[#F2A93B] hover:text-[#F2A93B] disabled:opacity-60"
          >
            {photoKey ? "Replace photo" : "Upload photo"}
          </button>

          {photoKey && (
            <span className="text-xs font-semibold text-[#34D399]">
              ✓ Uploaded
            </span>
          )}

          {uploading && (
            <span className="text-xs text-[#8B93A5]">Uploading…</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUploadPhoto(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
};

export interface IdentityDocumentsProps {
  onContinue: (form: IdentityDocForm, files: IdentityDocUploadResult) => void;
  /** Same contract as FileUploader.onUploadFile — returns the storage key. */
  onUploadFile: (file: File, slotKey: string) => Promise<string>;
  submitting?: boolean;
}

export const IdentityDocuments: React.FC<IdentityDocumentsProps> = ({
  onContinue,
  onUploadFile,
  submitting,
}) => {
  const [form, setForm] = useState<IdentityDocForm>({
    aadhaarNumber: "",
    aadhaarIssuedDate: "",
    panNumber: "",
    panIssuedDate: "",
    voterIdNumber: "",
    voterIdIssuedDate: "",
  });

  const [files, setFiles] = useState<IdentityDocUploadResult>({});
  const [uploadingKey, setUploadingKey] = useState<DocFileKey | null>(null);

  const set = <K extends keyof IdentityDocForm>(key: K, value: IdentityDocForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleUpload = async (file: File, slotKey: DocFileKey, apiKey: string) => {
    setUploadingKey(slotKey);
    try {
      const key = await onUploadFile(file, apiKey);
      setFiles((f) => ({ ...f, [slotKey]: key }));
    } catch {
      // let parent surface the toast; just stop the spinner here
    } finally {
      setUploadingKey(null);
    }
  };

  const canContinue =
    form.aadhaarNumber.trim() !== "" &&
    form.aadhaarIssuedDate !== "" &&
    !!files.aadhaarPhotoKey &&
    form.panNumber.trim() !== "" &&
    form.panIssuedDate !== "" &&
    !!files.panPhotoKey &&
    form.voterIdNumber.trim() !== "" &&
    form.voterIdIssuedDate !== "" &&
    !!files.voterIdPhotoKey &&
    !submitting;

  return (
    <section className="mx-auto w-full max-w-2xl">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <span className='font-["IBM_Plex_Mono",monospace] text-xs font-semibold uppercase tracking-[0.18em] text-[#F2A93B]'>
            Step 1 of 4
          </span>
          <span className="text-xs font-medium text-[#8B93A5]">
            Identity Documents
          </span>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#2A2F3A]">
          <div className="h-full w-1/4 rounded-full bg-[#F2A93B]" />
        </div>

        <h2 className='mt-6 font-["Space_Grotesk",sans-serif] text-3xl font-bold text-[#F2F3F5]'>
          Verify Your Identity
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#8B93A5]">
          We only accept Aadhaar, PAN and Voter ID as identity proof. Enter each
          document's number and issued date, then upload a clear photo.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <DocCard
          title="Aadhaar Card"
          hint="Government-issued Aadhaar ID"
          numberLabel="Aadhaar Number"
          numberValue={form.aadhaarNumber}
          onNumberChange={(v) => set("aadhaarNumber", v)}
          issuedDate={form.aadhaarIssuedDate}
          onIssuedDateChange={(v) => set("aadhaarIssuedDate", v)}
          photoKey={files.aadhaarPhotoKey}
          uploading={uploadingKey === "aadhaarPhotoKey"}
          onUploadPhoto={(file) => handleUpload(file, "aadhaarPhotoKey", "aadhaar_photo")}
        />

        <DocCard
          title="PAN Card"
          hint="Permanent Account Number"
          numberLabel="PAN Number"
          numberValue={form.panNumber}
          onNumberChange={(v) => set("panNumber", v)}
          issuedDate={form.panIssuedDate}
          onIssuedDateChange={(v) => set("panIssuedDate", v)}
          photoKey={files.panPhotoKey}
          uploading={uploadingKey === "panPhotoKey"}
          onUploadPhoto={(file) => handleUpload(file, "panPhotoKey", "pan_photo")}
        />

        <DocCard
          title="Voter ID Card"
          hint="Election Commission issued Voter ID"
          numberLabel="Voter ID Number"
          numberValue={form.voterIdNumber}
          onNumberChange={(v) => set("voterIdNumber", v)}
          issuedDate={form.voterIdIssuedDate}
          onIssuedDateChange={(v) => set("voterIdIssuedDate", v)}
          photoKey={files.voterIdPhotoKey}
          uploading={uploadingKey === "voterIdPhotoKey"}
          onUploadPhoto={(file) => handleUpload(file, "voterIdPhotoKey", "voter_id_photo")}
        />
      </div>

      <div className="mt-10 border-t border-[#2A2F3A] pt-6">
        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => onContinue(form, files)}
            className={[
              "flex h-12 min-w-[220px] items-center justify-center rounded-xl px-8 text-sm font-bold transition-all duration-200",
              canContinue
                ? "bg-[#F2A93B] text-[#12151C] shadow-lg shadow-[#F2A93B]/20 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
                : "cursor-not-allowed bg-[#2A2F3A] text-[#8B93A5]",
            ].join(" ")}
          >
            {submitting ? "Saving..." : "Continue to Address →"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default IdentityDocuments;