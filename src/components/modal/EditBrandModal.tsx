import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Pencil, Search } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { sanitizeName } from "@/lib/validation";

const toSlug = (name: string) =>
  name.toLowerCase().replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

import { Brand } from "./DeleteBrandModal";

interface Category {
  id: string;
  name: string;
}

interface EditBrandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
  onSuccess: () => void;
}

export const EditBrandModal = ({ open, onOpenChange, brand, onSuccess }: EditBrandModalProps) => {
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCat, setLoadingCat] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  useEffect(() => {
    if (open && brand) {
      setEditName(brand.name);
      setEditDescription(brand.description || "");
      setSelectedCategories(brand.category_id || []);
      setCatSearch("");
      fetchCategories();
    }
  }, [open, brand]);

  const fetchCategories = async () => {
    setLoadingCat(true);
    try {
      const { data } = await axiosInstance.get(API_URL.CATEGORIES);
      setCategories(Array.isArray(data?.categories) ? data?.categories : []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoadingCat(false);
    }
  };

  const handleToggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleEdit = async () => {
    if (!brand || !editName.trim() || !editDescription.trim() || selectedCategories.length === 0) { 
      toast.error("Brand name, description and at least one category are required."); 
      return; 
    }
    setSubmitting(true);
    try {
      await axiosInstance.patch(`${API_URL.ADMIN_BRANDS}/${brand.id}`, {
        name: editName.trim(),
        slug: toSlug(editName.trim()),
        description: editDescription.trim(),
        category_id: selectedCategories
      });
      toast.success(`Brand updated successfully!`);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update brand.");
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[1.5rem] p-0 overflow-hidden border-zinc-200/60 flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <DialogTitle className="text-xl font-bold text-zinc-900 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Pencil className="h-5 w-5 text-amber-600" />
            </div>
            Edit Brand Details
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-5 overflow-y-auto min-h-0">
          <div className="space-y-2">
            <Label className="text-zinc-700 font-bold text-sm">Brand Name <span className="text-red-500">*</span></Label>
            <Input value={editName} onChange={(e) => setEditName(sanitizeName(e.target.value))} placeholder="Brand name" className="bg-zinc-50/50 border-zinc-200 h-12 px-4 rounded-xl font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-700 font-bold text-sm">Slug Definition</Label>
            <Input value={toSlug(editName)} readOnly className="bg-zinc-100 border-zinc-200 h-12 px-4 rounded-xl text-zinc-500 font-mono text-sm shadow-sm cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-700 font-bold text-sm">Description <span className="text-red-500">*</span></Label>
            <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Updated description..." rows={3} className="bg-zinc-50/50 border-zinc-200 p-4 rounded-xl font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm resize-none" />
          </div>

          <div className="space-y-3">
            <Label className="text-zinc-700 font-bold text-sm flex justify-between items-center">
              <span>Categories <span className="text-red-500">*</span></span>
              <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">{selectedCategories.length} selected</span>
            </Label>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Search categories..."
                className="pl-9 bg-zinc-50/50 border-zinc-200 h-10 rounded-xl focus:border-amber-500 focus:ring-amber-500/10 shadow-sm text-sm"
              />
            </div>

            <div className="border border-zinc-200 rounded-xl bg-zinc-50/50 p-2 max-h-40 overflow-y-auto shadow-inner">
              {loadingCat ? (
                <div className="py-4 text-center"><Loader2 className="animate-spin h-5 w-5 mx-auto text-zinc-400" /></div>
              ) : categories.length === 0 ? (
                <div className="py-4 text-center text-zinc-500 text-sm">No categories available.</div>
              ) : (
                <div className="space-y-1">
                  {categories
                    .filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
                    .map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 p-2 hover:bg-zinc-100 rounded-lg cursor-pointer transition-colors">
                      <Checkbox 
                        checked={selectedCategories.includes(cat.id)} 
                        onCheckedChange={() => handleToggleCategory(cat.id)}
                        className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <span className="text-sm font-medium text-zinc-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="p-6 pt-4 border-t border-zinc-100 bg-zinc-50/30 flex gap-3 sm:gap-3 shrink-0">
          <DialogClose asChild><Button variant="outline" className="rounded-xl h-11 px-5 font-bold border-zinc-200">Cancel</Button></DialogClose>
          <Button onClick={handleEdit} disabled={submitting || !editName.trim() || !editDescription.trim() || selectedCategories.length === 0} className="rounded-xl h-11 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20 active:scale-[0.97]">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
