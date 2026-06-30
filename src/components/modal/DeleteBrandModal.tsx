import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";

export interface Brand {
  id: string;
  category_id?: string[];
  name: string;
  slug?: string;
  description?: string;
}

interface DeleteBrandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
  onSuccess: () => void;
}

export const DeleteBrandModal = ({ open, onOpenChange, brand, onSuccess }: DeleteBrandModalProps) => {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!brand) return;
    setSubmitting(true);
    try {
      const response = await axiosInstance.delete(`${API_URL.ADMIN_BRANDS}/${brand.id}`);
      
      const successMsg = response.data?.message || `Brand "${brand.name}" deleted.`;
      const description = [];
      if (response.data?.updated_rejected_listing_count) {
        description.push(`${response.data.updated_rejected_listing_count} rejected listings updated`);
      }
      
      if (description.length > 0) {
        toast.success(successMsg, { description: description.join(", ") });
      } else {
        toast.success(successMsg);
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      let errorMessage = "Failed to delete brand.";
      const data = err?.response?.data;
      
      if (data?.detail?.message) {
        errorMessage = data.detail.message;
        if (data.detail.listing_status_counts) {
          const counts = Object.entries(data.detail.listing_status_counts)
            .map(([status, count]) => `${status.replace('_', ' ')}: ${count}`)
            .join(", ");
          errorMessage += ` (${counts})`;
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
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Delete Brand?</h3>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-zinc-700">"{brand?.name}"</span>? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl h-11 font-bold border-zinc-200">
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={submitting} className="flex-1 rounded-xl h-11 bg-red-500 hover:bg-red-600 text-white font-bold shadow-md shadow-red-500/20 active:scale-[0.97]">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
