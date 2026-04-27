"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Loader2, Edit } from "lucide-react";
import { updateMyProfile } from "@/app/actions/user";
import imageCompression from "browser-image-compression";

export function EditProfileDialog({ memberProfile }: { memberProfile: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(memberProfile?.photo_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const photoFile = formData.get("photo") as File;
        if (photoFile && photoFile.size > 0) {
            try {
                const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 800,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(photoFile, options);
                // Create a new file from the blob to maintain the name
                const newFile = new File([compressedFile], photoFile.name, { type: compressedFile.type });
                formData.set("photo", newFile);
            } catch (error) {
                console.error("Image compression error:", error);
            }
        }

        const res = await updateMyProfile(formData);
        if (res.success) {
            setIsOpen(false);
        } else {
            alert(res.error || "Failed to update profile");
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-[#080808] text-[rgba(255,255,255,0.4)] border-white/[0.06]/30 hover:bg-[#0d0d0d] hover:text-white uppercase tracking-widest text-[10px] font-bold">
                    <Edit className="w-3 h-3 mr-2" /> Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#080808] border-[#E8192B]/20 text-[rgba(255,255,255,0.85)] sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-heading text-2xl font-black uppercase tracking-widest text-[#E8192B]">
                        Warrior Profile
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4" encType="multipart/form-data">
                    <div className="flex flex-col items-center">
                        <Input
                            type="file"
                            name="photo"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />

                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-[#111111] overflow-hidden border-l-4 border-[#E8192B]">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Warrior Profile"
                                        className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-[rgba(255,255,255,0.4)]/40 group-hover:text-[#E8192B]/60 transition-colors">
                                        <Edit className="w-8 h-8 mb-2" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-center px-4">Upload<br/>Photo</span>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                className="absolute -bottom-2 -right-2 bg-[#E8192B] p-3 text-white shadow-[0_10px_20px_rgba(232,25,43,0.15)] active:scale-90 transition-transform hover:scale-105"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                            >
                                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.4)] opacity-60">Age (Optional)</Label>
                            <Input name="age" type="number" defaultValue={memberProfile?.age || ""} className="bg-[#080808] border-white/[0.06]/30 focus-visible:ring-[#E8192B] font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.4)] opacity-60">Date of Birth</Label>
                            <Input name="dob" type="date" defaultValue={memberProfile?.dob || ""} className="bg-[#080808] border-white/[0.06]/30 focus-visible:ring-[#E8192B] font-bold color-scheme-dark" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.4)] opacity-60">Weight (kg)</Label>
                            <Input name="weight" type="number" step="0.1" defaultValue={memberProfile?.weight || ""} className="bg-[#080808] border-white/[0.06]/30 focus-visible:ring-[#E8192B] font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.4)] opacity-60">Height (cm)</Label>
                            <Input name="height" type="number" defaultValue={memberProfile?.height || ""} className="bg-[#080808] border-white/[0.06]/30 focus-visible:ring-[#E8192B] font-bold" />
                        </div>
                    </div>

                    <DialogFooter className="pt-6 border-t border-white/[0.06]/20">
                        <Button type="submit" disabled={loading} className="w-full bg-[#E8192B] hover:opacity-90 text-white font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(232,25,43,0.15)] h-12">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Update Warrior Status
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
