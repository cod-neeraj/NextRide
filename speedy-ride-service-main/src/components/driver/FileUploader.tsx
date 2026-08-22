import React, { useEffect, useCallback, useRef, useState } from "react";
import type { DocumentSlot, UploadedFile } from "../../types/driver";
import { UploadCard } from "./UploadCard";

export interface FileUploaderProps {
    title?: string;
    subtitle?: string;
    slots: DocumentSlot[];
    onFilesChange?: (slots: DocumentSlot[]) => void;
    onUploadFile?: (file: File, slotKey: string) => Promise<void>;
}

function simulateUpload(
    onProgress: (pct: number) => void
): Promise<void> {
    return new Promise((resolve) => {
        let pct = 0;
        const interval = setInterval(() => {
            pct += 10 + Math.random() * 20;
            if (pct >= 100) {
                pct = 100;
                onProgress(100);
                clearInterval(interval);
                setTimeout(resolve, 300);
            } else {
                onProgress(pct);
            }
        }, 180);
    });
}

export const FileUploader: React.FC<FileUploaderProps> = ({
    title,
    subtitle,
    slots: initialSlots,
    onFilesChange,
    onUploadFile,
}) => {
    const [slots, setSlots] = useState<DocumentSlot[]>(initialSlots);
    const [dragOverKey, setDragOverKey] = useState<string | null>(null);
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // notify parent AFTER render commits, not during setState updater
    useEffect(() => {
        onFilesChange?.(slots);
    }, [slots]);

    const updateSlot = useCallback(
        (key: string, updater: (s: DocumentSlot) => DocumentSlot) => {
            setSlots((prev) => prev.map((s) => (s.key === key ? updater(s) : s)));
        },
        []
    );


    const handleFile = useCallback(
        async (key: string, file: File) => {
            const slot = slots.find((s) => s.key === key);
            if (!slot) return;

            // validation
            const maxBytes = slot.maxSizeMb * 1024 * 1024;
            if (file.size > maxBytes) {
                updateSlot(key, (s) => ({
                    ...s,
                    file: {
                        id: crypto.randomUUID(),
                        file,
                        status: "error",
                        progress: 0,
                        errorMessage: `Max size is ${slot.maxSizeMb}MB`,
                    },
                }));
                return;
            }

            const previewUrl = file.type.startsWith("image/")
                ? URL.createObjectURL(file)
                : undefined;

            const uploaded: UploadedFile = {
                id: crypto.randomUUID(),
                file,
                previewUrl,
                status: "uploading",
                progress: 0,
            };
            updateSlot(key, (s) => ({ ...s, file: uploaded }));

            const setProgress = (pct: number) =>
                updateSlot(key, (s) =>
                    s.file ? { ...s, file: { ...s.file, progress: pct } } : s
                );

            try {
                if (onUploadFile) {
                    await onUploadFile(file, key);
                } else {
                    await simulateUpload(setProgress);
                }
                updateSlot(key, (s) =>
                    s.file
                        ? { ...s, file: { ...s.file, status: "verified", progress: 100 } }
                        : s
                );
            } catch (err) {
                updateSlot(key, (s) =>
                    s.file
                        ? {
                            ...s,
                            file: {
                                ...s.file,
                                status: "error",
                                errorMessage:
                                    err instanceof Error ? err.message : "Upload failed",
                            },
                        }
                        : s
                );
            }
        },
        [slots, updateSlot, onUploadFile]
    );

    const handleDrop = useCallback(
        (key: string, e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragOverKey(null);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(key, file);
        },
        [handleFile]
    );

    const handleRemove = useCallback(
        (key: string) => {
            updateSlot(key, (s) => {
                if (s.file?.previewUrl) URL.revokeObjectURL(s.file.previewUrl);
                return { ...s, file: undefined };
            });
        },
        [updateSlot]
    );

    const requiredCount = slots.filter((s) => s.required).length;
    const doneCount = slots.filter(
        (s) => s.required && s.file?.status === "verified"
    ).length;

    return (
        <>
            <div className="font-[Inter,sans-serif]">
                {(title || subtitle) && (
                    <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                            {title && (
                                <h3 className='font-["Space_Grotesk",sans-serif] text-[16px] font-bold text-[#F2F3F5]'>
                                    {title}
                                </h3>
                            )}

                            {subtitle && (
                                <p className="mt-0.5 text-[13px] text-[#8B93A5]">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {requiredCount > 0 && (
                            <span className='shrink-0 rounded-full border border-[#2A2F3A] bg-[#1A1E27] px-2.5 py-1 font-["IBM_Plex_Mono",monospace] text-[11px] font-semibold text-[#8B93A5]'>
                                {doneCount}/{requiredCount} verified
                            </span>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {slots.map((slot) => (
                        <div
                            key={slot.key}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOverKey(slot.key);
                            }}
                            onDragLeave={() =>
                                setDragOverKey((k) => (k === slot.key ? null : k))
                            }
                            onDrop={(e) => handleDrop(slot.key, e)}
                        >
                            <input
                                ref={(el) => {
                                    inputRefs.current[slot.key] = el;
                                }}
                                type="file"
                                accept={slot.accept}
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleFile(slot.key, file);
                                    }
                                    e.target.value = "";
                                }}
                            />

                            <UploadCard
                                slot={slot}
                                isDragActive={dragOverKey === slot.key}
                                onBrowse={() => inputRefs.current[slot.key]?.click()}
                                onRemove={() => handleRemove(slot.key)}
                                onRetry={() => inputRefs.current[slot.key]?.click()}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
export default FileUploader;