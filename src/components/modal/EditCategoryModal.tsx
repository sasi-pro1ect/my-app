import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, UploadCloud, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { resizePngToFit } from "@/lib/image";
import { sanitizeName } from "@/lib/validation";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

const toSlug = (name: string) =>
  name.toLowerCase().replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

interface EditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}

export const EditCategoryModal = ({ open, onOpenChange, category, onSuccess }: EditCategoryModalProps) => {
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const isChanged = category ? (
    editName.trim() !== category.name.trim() ||
    editDescription.trim() !== (category.description || "").trim() ||
    editImage !== null
  ) : false;

  useEffect(() => {
    if (category && open) {
      setEditName(category.name);
      setEditDescription(category.description || "");
      setEditImage(null);
      setEditImagePreview(category.image_url || null);
    }
  }, [category, open]);

  useEffect(() => {
    return () => {
      if (editImagePreview?.startsWith("blob:")) URL.revokeObjectURL(editImagePreview);
    };
  }, [editImagePreview]);

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/png") {
      toast.error("Only PNG images are allowed");
      e.target.value = "";
      return;
    }

    try {
      const resized = await resizePngToFit(file, 594, 593);
      setEditImage(resized);
      setEditImagePreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return URL.createObjectURL(resized);
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to process image");
    } finally {
      e.target.value = "";
    }
  };

  const handleEdit = async () => {
    if (!category || !editName.trim() || !editDescription.trim()) {
      toast.error("Category name and description are required.");
      return;
    }
    setEditSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", editName.trim());
      formData.append("slug", toSlug(editName.trim()));
      formData.append("description", editDescription.trim());
      if (editImage) {
        formData.append("image", editImage);
      }

      await axiosInstance.patch(`${API_URL.ADMIN_CATEGORIES}/${category.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Category updated successfully!`);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update category.");
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[1.5rem] p-0 border-zinc-200/60 max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <DialogTitle className="text-xl font-semibold text-zinc-900 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Pencil className="h-5 w-5 text-amber-600" />
            </div>
            Edit Category
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-5 overflow-y-auto min-h-0">
          <div className="space-y-2">
            <Label className="text-zinc-700 font-semibold text-sm">Category Name <span className="text-red-500">*</span></Label>
            <Input 
              value={editName} 
              onChange={(e) => setEditName(sanitizeName(e.target.value))}
              placeholder="Category name" 
              className="bg-zinc-50/50 border-zinc-200 h-12 px-4 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-700 font-semibold text-sm">Slug</Label>
            <Input value={toSlug(editName)} readOnly className="bg-zinc-100 border-zinc-200 h-12 px-4 rounded-xl text-zinc-500 font-mono text-sm shadow-sm cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-700 font-semibold text-sm">Description <span className="text-red-500">*</span></Label>
            <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Updated description..." rows={3} className="bg-zinc-50/50 border-zinc-200 p-4 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm resize-none" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-700 font-semibold text-sm">Category Image</Label>
              {editImage !== null && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditImage(null);
                    setEditImagePreview((prev) => {
                      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                      return category?.image_url || null;
                    });
                  }}
                  className="h-7 px-2.5 text-xs font-semibold text-zinc-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                >
                  Reset Image
                </Button>
              )}
            </div>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-200 border-dashed rounded-xl bg-zinc-50/50 hover:bg-zinc-100/50 transition-colors cursor-pointer relative overflow-hidden group">
              <input
                type="file"
                accept="image/png"
                onChange={handleEditImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {editImagePreview ? (
                <div className="relative w-full h-32">
                  <img src={editImagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <span className="text-white text-sm font-medium flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-center flex flex-col items-center pointer-events-none">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <ImageIcon className="mx-auto h-6 w-6 text-amber-500" />
                  </div>
                  <div className="flex text-sm text-zinc-600">
                    <span className="relative rounded-md font-semibold text-amber-600">
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
          <Button onClick={handleEdit} disabled={editSubmitting || !editName.trim() || !editDescription.trim() || !isChanged} className="rounded-xl h-11 px-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md shadow-amber-500/20 active:scale-[0.97]">
            {editSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
            {editSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
