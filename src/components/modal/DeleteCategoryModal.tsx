import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";

// Re-use standard Category interface, or could import from a types file if one exists.
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

interface DeleteCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}

export const DeleteCategoryModal = ({ open, onOpenChange, category, onSuccess }: DeleteCategoryModalProps) => {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!category) return;
    setSubmitting(true);
    try {
      const response = await axiosInstance.delete(`${API_URL.ADMIN_CATEGORIES}/${category.id}`);
      
      const successMsg = response.data?.message || `Category "${category.name}" deleted.`;
      const description = [];
      if (response.data?.deleted_subcategory_count) description.push(`${response.data.deleted_subcategory_count} sub-categories`);
      if (response.data?.deleted_brand_count) description.push(`${response.data.deleted_brand_count} brands`);
      if (response.data?.updated_rejected_listing_count) description.push(`${response.data.updated_rejected_listing_count} rejected listings`);
      
      if (description.length > 0) {
        toast.success(successMsg, { description: `Includes: ${description.join(", ")}` });
      } else {
        toast.success(successMsg);
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      let errorMessage = "Failed to delete category.";
      const data = err?.response?.data;
      
      if (data?.detail?.message) {
        errorMessage = data.detail.message;
        if (data.detail.listing_status_counts) {
          const counts = Object.entries(data.detail.listing_status_counts)
            .map(([status, count]) => `${status.replace('_', ' ')}: ${count}`)
            .join(", ");
          errorMessage += ` (${counts})`;
        }
        if (data.detail.brands && Array.isArray(data.detail.brands)) {
          const brandNames = data.detail.brands.map((b: any) => b.name).join(", ");
          errorMessage += ` (Brands: ${brandNames})`;
        }
      } else if (data?.message) {
        errorMessage = data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-[1.5rem] p-0 overflow-hidden border-zinc-200/60">
        <div className="p-8 text-center space-y-5">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <Trash2 className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">Delete Category?</h3>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-zinc-700">"{category?.name}"</span>? All sub-categories under this category will also be permanently deleted. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl h-11 font-semibold border-zinc-200">
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={submitting} className="flex-1 rounded-xl h-11 bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md shadow-red-500/20 active:scale-[0.97]">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
