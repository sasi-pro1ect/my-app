import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Layers, Plus, UploadCloud, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { resizePngToFit } from "@/lib/image";
import { sanitizeName } from "@/lib/validation";

const toSlug = (name: string) =>
  name.toLowerCase().replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

interface CreateCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateCategoryModal = ({ open, onOpenChange, onSuccess }: CreateCategoryModalProps) => {
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Clear form when modal closes/opens to ensure fresh state
  useEffect(() => {
    if (open) {
      setNewName("");
      setNewDescription("");
      setNewImage(null);
      setNewImagePreview(null);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (newImagePreview?.startsWith("blob:")) URL.revokeObjectURL(newImagePreview);
    };
  }, [newImagePreview]);

  const handleNewImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/png") {
      toast.error("Only PNG images are allowed");
      e.target.value = "";
      return;
    }

    try {
      const resized = await resizePngToFit(file, 594, 593);
      setNewImage(resized);
      setNewImagePreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return URL.createObjectURL(resized);
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to process image");
    } finally {
      e.target.value = "";
    }
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newDescription.trim()) { 
      toast.error("Category name and description are required."); 
      return; 
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", newName.trim());
      formData.append("slug", toSlug(newName.trim()));
      formData.append("description", newDescription.trim());
      if (newImage) {
        formData.append("image", newImage);
      }

      await axiosInstance.post(API_URL.ADMIN_CATEGORIES, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Category "${newName.trim()}" created successfully!`);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create category.");
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[1.5rem] p-0 overflow-hidden border-zinc-200/60 flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <DialogTitle className="text-xl font-semibold text-zinc-900 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#00B523]/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-[#00B523]" />
            </div>
            Add New Category
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-5 overflow-y-auto min-h-0">
          <div className="space-y-2">
            <Label className="text-zinc-700 font-semibold text-sm">Category Name <span className="text-red-500">*</span></Label>
            <Input 
              value={newName} 
              onChange={(e) => setNewName(sanitizeName(e.target.value))}
              placeholder="e.g. Fresh Fish & Seafood" 
              className="bg-zinc-50/50 border-zinc-200 h-12 px-4 rounded-xl focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 shadow-sm" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-700 font-semibold text-sm">Description <span className="text-red-500">*</span></Label>
            <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Brief description..." rows={3} className="bg-zinc-50/50 border-zinc-200 p-4 rounded-xl focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 shadow-sm resize-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-700 font-semibold text-sm">Category Image</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-200 border-dashed rounded-xl bg-zinc-50/50 hover:bg-zinc-100/50 transition-colors cursor-pointer relative overflow-hidden group">
              <input
                type="file"
                accept="image/png"
                onChange={handleNewImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {newImagePreview ? (
                <div className="relative w-full h-32">
                  <img src={newImagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <span className="text-white text-sm font-medium flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-center flex flex-col items-center pointer-events-none">
                  <div className="w-12 h-12 bg-[#00B523]/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <ImageIcon className="mx-auto h-6 w-6 text-[#00B523]" />
                  </div>
                  <div className="flex text-sm text-zinc-600">
                    <span className="relative rounded-md font-semibold text-[#00B523]">
                      Upload a file
                    </span>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-zinc-500">PNG only, auto-resized to 594×593</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="p-6 pt-4 border-t border-zinc-100 bg-zinc-50/30 flex gap-3 sm:gap-3 shrink-0">
          <DialogClose asChild><Button variant="outline" className="rounded-xl h-11 px-5 font-semibold border-zinc-200">Cancel</Button></DialogClose>
          <Button onClick={handleCreate} disabled={submitting || !newName.trim() || !newDescription.trim()} className="rounded-xl h-11 px-6 bg-[#00B523] hover:bg-[#009A1D] text-white font-semibold shadow-md shadow-[#00B523]/20 active:scale-[0.97]">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {submitting ? "Creating..." : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
