import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Tag, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { sanitizeName } from "@/lib/validation";

const toSlug = (name: string) =>
  name.toLowerCase().replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

interface Category {
  id: string;
  name: string;
}

interface CreateBrandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateBrandModal = ({ open, onOpenChange, onSuccess }: CreateBrandModalProps) => {
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCat, setLoadingCat] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  useEffect(() => {
    if (open) {
      setNewName("");
      setNewDescription("");
      setSelectedCategories([]);
      setCatSearch("");
      fetchCategories();
    }
  }, [open]);

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

  const handleCreate = async () => {
    if (!newName.trim() || !newDescription.trim() || selectedCategories.length === 0) { 
      toast.error("Brand name, description and at least one category are required."); 
      return; 
    }
    setSubmitting(true);
    try {
      await axiosInstance.post(API_URL.ADMIN_BRANDS, {
        name: newName.trim(),
        slug: toSlug(newName.trim()),
        description: newDescription.trim(),
        category_id: selectedCategories
      });
      toast.success(`Brand "${newName.trim()}" created successfully!`);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create brand.");
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[1.5rem] p-0 overflow-hidden border-zinc-200/60 flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <DialogTitle className="text-xl font-bold text-zinc-900 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#00B523]/10 flex items-center justify-center">
              <Tag className="h-5 w-5 text-[#00B523]" />
            </div>
            Add New Brand
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-5 overflow-y-auto min-h-0">
          <div className="space-y-2">
            <Label className="text-zinc-700 font-bold text-sm">Brand Name <span className="text-red-500">*</span></Label>
            <Input value={newName} onChange={(e) => setNewName(sanitizeName(e.target.value))} placeholder="e.g. Allen Solly" className="bg-zinc-50/50 border-zinc-200 h-12 px-4 rounded-xl font-medium focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 shadow-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-700 font-bold text-sm">Description <span className="text-red-500">*</span></Label>
            <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Brief description of the brand..." rows={3} className="bg-zinc-50/50 border-zinc-200 p-4 rounded-xl font-medium focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 shadow-sm resize-none" />
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
                className="pl-9 bg-zinc-50/50 border-zinc-200 h-10 rounded-xl focus:border-[#00B523] focus:ring-[#00B523]/10 shadow-sm text-sm"
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
                        className="data-[state=checked]:bg-[#00B523] data-[state=checked]:border-[#00B523]"
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
          <Button onClick={handleCreate} disabled={submitting || !newName.trim() || !newDescription.trim() || selectedCategories.length === 0} className="rounded-xl h-11 px-6 bg-[#00B523] hover:bg-[#009A1D] text-white font-bold shadow-md shadow-[#00B523]/20 active:scale-[0.97]">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {submitting ? "Creating..." : "Create Brand"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
