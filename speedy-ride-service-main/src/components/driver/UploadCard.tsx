// UploadCard.tsx
// Renders a single document slot: label, hint, status pill, thumbnail/progress,
// and retry/remove actions. Pure presentation — no upload logic lives here.

import React from "react";
import type { DocumentSlot } from "../../types/driver";

export interface UploadCardProps {
  slot: DocumentSlot;
  onBrowse: () => void;
  onRemove: () => void;
  onRetry: () => void;
  isDragActive?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; dot: string; text: string }
> = {
  idle: { label: "Not uploaded", dot: "bg-[#8B93A5]", text: "text-[#8B93A5]" },
  uploading: { label: "Uploading…", dot: "bg-[#F2A93B]", text: "text-[#F2A93B]" },
  verifying: { label: "Verifying…", dot: "bg-[#F2A93B]", text: "text-[#F2A93B]" },
  verified: { label: "Verified", dot: "bg-[#34D399]", text: "text-[#34D399]" },
  error: { label: "Upload failed", dot: "bg-[#F2545B]", text: "text-[#F2545B]" },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  slot,
  onBrowse,
  onRemove,
  onRetry,
  isDragActive,
}) => {
  const uf = slot.file;
  const status = uf?.status ?? "idle";
  const cfg = statusConfig[status];
  const isImage = uf?.file.type.startsWith("image/");

 return (
  <div
    className={[
      "group relative overflow-hidden rounded-2xl border bg-[#1A1E27] p-5 shadow-sm transition-all duration-300",
      isDragActive
        ? "border-[#F2A93B] ring-2 ring-[#F2A93B]/30"
        : status === "verified"
        ? "border-[#34D399]/40 bg-[#18251F]"
        : status === "error"
        ? "border-[#F2545B]/40"
        : "border-[#2A2F3A] hover:border-[#3A404E] hover:bg-[#1D222C]",
    ].join(" ")}
  >
    <div className="absolute -left-[8px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#0F1218]" />

    <div className="flex items-center gap-5">
      {/* Thumbnail */}
      <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#2A2F3A] bg-[#12151C]">
        {uf && isImage && uf.previewUrl ? (
          <img
            src={uf.previewUrl}
            alt={slot.label}
            className="h-full w-full object-cover"
          />
        ) : uf ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
              stroke="#8B93A5"
              strokeWidth="1.6"
            />
            <path d="M15 2v5h5" stroke="#8B93A5" strokeWidth="1.6" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V4m0 0L7 9m5-5l5 5"
              stroke="#8B93A5"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
              stroke="#8B93A5"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className='truncate font-["Space_Grotesk",sans-serif] text-[15px] font-bold text-[#F2F3F5]'>
            {slot.label}
          </h3>

          {slot.required && (
            <span className="rounded-full bg-[#F2A93B]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#F2A93B]">
              Required
            </span>
          )}
        </div>

        {!uf ? (
          <>
            <p className="mt-2 text-sm leading-5 text-[#8B93A5]">
              {slot.hint}
            </p>

            <p className="mt-1 text-xs text-[#687086]">
              Drag & Drop or click Upload File
            </p>
          </>
        ) : (
          <>
            <p className='mt-2 truncate font-["IBM_Plex_Mono",monospace] text-xs text-[#8B93A5]'>
              {uf.file.name} • {formatBytes(uf.file.size)}
            </p>

            {(status === "uploading" || status === "verifying") && (
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#2A2F3A]">
                <div
                  className="h-full rounded-full bg-[#F2A93B] transition-all duration-300"
                  style={{ width: `${uf.progress}%` }}
                />
              </div>
            )}

            <div className="mt-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#20242E] px-3 py-1">
                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                <span className={`text-xs font-semibold ${cfg.text}`}>
                  {cfg.label}
                </span>
              </div>

              {status === "error" && uf.errorMessage && (
                <p className="mt-2 text-xs text-[#F2545B]">
                  {uf.errorMessage}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {!uf && (
          <button
            type="button"
            onClick={onBrowse}
            className="rounded-xl bg-[#F2A93B] px-4 py-2 text-sm font-semibold text-[#12151C] transition-all hover:brightness-110"
          >
            Upload File
          </button>
        )}

        {uf && status === "error" && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl border border-[#F2545B]/40 px-4 py-2 text-sm font-semibold text-[#F2545B] transition-all hover:bg-[#F2545B]/10"
          >
            Try Again
          </button>
        )}

        {uf && status === "verified" && (
          <button
            type="button"
            onClick={onBrowse}
            className="rounded-xl border border-[#2A2F3A] px-4 py-2 text-sm font-semibold text-[#8B93A5] transition-all hover:border-[#F2A93B] hover:text-[#F2A93B]"
          >
            Change File
          </button>
        )}

        {uf && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove file"
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#F2545B]/10 text-[#F2545B] transition-all hover:bg-[#F2545B] hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  </div>
);
};

export default UploadCard;