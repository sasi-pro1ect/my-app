import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Layers, Calendar, Plus, ArrowLeft, Trash2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { EditCategoryModal } from "@/components/modal/EditCategoryModal";
import { DeleteCategoryModal } from "@/components/modal/DeleteCategoryModal";
import { sanitizeName } from "@/lib/validation";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

const toSlug = (name: string) =>
  name.toLowerCase().replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [catLoading, setCatLoading] = useState(true);

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subLoading, setSubLoading] = useState(true);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  // Edit Category Modal
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);

  // Delete Category
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);

  // Create sub-category
  const [subName, setSubName] = useState("");
  const [subDescription, setSubDescription] = useState("");
  const [subSubmitting, setSubSubmitting] = useState(false);
  const [createSubOpen, setCreateSubOpen] = useState(false);

  // Edit sub-category
  const [editSubOpen, setEditSubOpen] = useState(false);
  const [editSub, setEditSub] = useState<SubCategory | null>(null);
  const [editSubName, setEditSubName] = useState("");
  const [editSubDescription, setEditSubDescription] = useState("");
  const [editSubSubmitting, setEditSubSubmitting] = useState(false);

  // Delete sub-category
  const [deleteSubOpen, setDeleteSubOpen] = useState(false);
  const [deleteSub, setDeleteSub] = useState<SubCategory | null>(null);
  const [deleteSubSubmitting, setDeleteSubSubmitting] = useState(false);

  const fetchCategory = async () => {
    setCatLoading(true);
    try {
      const { data } = await axiosInstance.get(API_URL.CATEGORIES);
      const all: Category[] = Array.isArray(data?.categories) ? data?.categories : [];
      const found = all.find((c) => c.id === id);
      setCategory(found || null);
    } catch (err) {
      console.error("Failed to load category:", err);
      toast.error("Failed to load category details.");
    } finally {
      setCatLoading(false);
    }
  };

  const fetchSubCategories = async () => {
    if (!id) return;
    setSubLoading(true);
    try {
      const { data } = await axiosInstance.get(`${API_URL.CATEGORIES}/${id}/sub-categories`);
      setSubCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load sub-categories:", err);
    } finally {
      setSubLoading(false);
    }
  };

  const fetchBrands = async () => {
    if (!id) return;
    setBrandsLoading(true);
    try {
      const { data } = await axiosInstance.get(`${API_URL.BRANDS}?category=${id}`);
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load brands:", err);
    } finally {
      setBrandsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
    fetchSubCategories();
    fetchBrands();
  }, [id]);

  // --- CREATE ---
  const handleAddSub = async () => {
    if (!subName.trim() || !subDescription.trim()) {
      toast.error("Sub-category name and description are required.");
      return;
    }
    setSubSubmitting(true);
    try {
      await axiosInstance.post(API_URL.ADMIN_SUB_CATEGORIES, {
        category_id: id,
        name: subName.trim(),
        description: subDescription.trim(),
      });
      toast.success(`Sub-category "${subName.trim()}" added!`);
      setSubName("");
      setSubDescription("");
      setCreateSubOpen(false);
      fetchSubCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add sub-category.");
    } finally {
      setSubSubmitting(false);
    }
  };

  // --- EDIT ---
  const openEditSub = (sub: SubCategory) => {
    setEditSub(sub);
    setEditSubName(sub.name);
    setEditSubDescription(sub.description || "");
    setEditSubOpen(true);
  };

  const handleEditSub = async () => {
    if (!editSub || !editSubName.trim() || !editSubDescription.trim()) {
      toast.error("Sub-category name and description are required.");
      return;
    }
    setEditSubSubmitting(true);
    try {
      await axiosInstance.patch(`${API_URL.ADMIN_SUB_CATEGORIES}/${editSub.id}`, {
        name: editSubName.trim(),
        slug: toSlug(editSubName.trim()),
        description: editSubDescription.trim(),
      });
      toast.success(`Sub-category updated successfully!`);
      setEditSubOpen(false);
      setEditSub(null);
      fetchSubCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update sub-category.");
    } finally {
      setEditSubSubmitting(false);
    }
  };

  // --- DELETE SUB-CATEGORY ---
  const handleDeleteSub = async () => {
    if (!deleteSub) return;
    setDeleteSubSubmitting(true);
    try {
      const response = await axiosInstance.delete(`${API_URL.ADMIN_SUB_CATEGORIES}/${deleteSub.id}`);
      
      const successMsg = response.data?.message || `Sub-category "${deleteSub.name}" deleted.`;
      const description = [];
      if (response.data?.updated_rejected_listing_count) {
        description.push(`${response.data.updated_rejected_listing_count} rejected listings updated`);
      }
      
      if (description.length > 0) {
        toast.success(successMsg, { description: description.join(", ") });
      } else {
        toast.success(successMsg);
      }

      setDeleteSubOpen(false);
      setDeleteSub(null);
      fetchSubCategories();
    } catch (err: any) {
      let errorMessage = "Failed to delete sub-category.";
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
      setDeleteSubSubmitting(false);
    }
  };

  if (catLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm max-w-7xl mx-auto">
        <Loader2 className="h-12 w-12 animate-spin text-[#00B523] mb-5" />
        <p className="text-zinc-500 font-semibold tracking-wide text-lg">Loading category...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6 bg-zinc-50/50 rounded-[2rem] border-2 border-dashed border-zinc-200 text-center max-w-7xl mx-auto">
        <Layers className="h-12 w-12 text-zinc-300 mb-4" />
        <h3 className="text-2xl font-semibold text-zinc-900 mb-2">Category not found</h3>
        <p className="text-zinc-500 font-medium text-base mb-6">The requested category does not exist or has been removed.</p>
        <Button onClick={() => navigate("/dashboard/categories")} variant="outline" className="rounded-xl h-11 px-6 font-semibold">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00B523]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex items-center gap-5">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/categories")}
            className="h-12 w-12 p-0 rounded-2xl border-zinc-200 hover:bg-zinc-100 shrink-0 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-600" />
          </Button>
          {category.image_url ? (
            <img src={category.image_url} alt={category.name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-zinc-50 shadow-md shrink-0" />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#00B523]/10 to-[#00B523]/5 flex items-center justify-center text-[#00B523] ring-1 ring-[#00B523]/20 shadow-inner shrink-0">
              <Layers className="h-7 w-7" />
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{category.name}</h1>
              <Badge className="bg-[#00B523]/10 text-[#009A1D] border-none px-3 py-1 font-semibold text-sm shadow-sm">
                Category
              </Badge>
            </div>
            <p className="text-zinc-500 text-sm font-medium">
              Manage sub-categories and details for this category.
            </p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <Button
            onClick={() => setEditCategoryOpen(true)}
            variant="outline"
            className="h-11 px-5 border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl font-semibold shadow-sm transition-all"
          >
            <Pencil className="h-4 w-4 mr-2" /> Edit Category
          </Button>
          <Button
            onClick={() => setDeleteCategoryOpen(true)}
            variant="outline"
            className="h-11 px-5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-semibold shadow-sm transition-all"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Category Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-6">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-widest block mb-2">Category Name</span>
            <p className="text-lg font-semibold text-zinc-900">{category.name}</p>
          </div>
        </Card>
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-6">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-widest block mb-2">Slug</span>
            <p className="text-lg font-semibold text-zinc-700 font-mono">{category.slug}</p>
          </div>
        </Card>
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-6">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-widest block mb-2">Created</span>
            <p className="text-lg font-semibold text-zinc-700 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-400" />
              {new Date(category.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </p>
          </div>
        </Card>
        {category.description && (
          <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden sm:col-span-3">
            <div className="p-6">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-widest block mb-2">Description</span>
              <p className="text-[15px] font-medium text-zinc-700 leading-relaxed">{category.description}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Sub-Categories Section */}
      <div className="bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 border-b border-zinc-100">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2.5 mb-1">
              <Layers className="h-5 w-5 text-[#00B523]" /> Sub-Categories
            </h2>
            <p className="text-zinc-500 text-sm font-medium">
              {subCategories.length} sub-categor{subCategories.length === 1 ? 'y' : 'ies'} under {category.name}.
            </p>
          </div>
          <Button
            onClick={() => setCreateSubOpen(true)}
            className="mt-4 sm:mt-0 h-11 px-5 bg-[#00B523] hover:bg-[#009A1D] text-white rounded-2xl font-semibold text-sm shadow-md shadow-[#00B523]/20 transition-all active:scale-[0.97] flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Sub-Category
          </Button>
        </div>

        <div className="p-6 sm:p-8">
          {subLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((key) => (
                <div key={key} className="animate-pulse bg-zinc-50 rounded-xl p-5 border border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-zinc-200 rounded-lg shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-2/3 bg-zinc-200 rounded-md"></div>
                      <div className="h-3 w-1/3 bg-zinc-100 rounded-md"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : subCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 text-center">
              <Layers className="h-10 w-10 text-zinc-300 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 mb-1">No sub-categories yet</h3>
              <p className="text-sm font-medium text-zinc-500">Click "Add Sub-Category" above to create the first one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subCategories.map((sub) => (
                <div key={sub.id} className="flex flex-col gap-3 bg-zinc-50/50 border border-zinc-200/60 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#00B523]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                      <Layers className="h-4 w-4 text-[#00B523]" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-zinc-900 truncate">{sub.name}</p>
                      <span className="text-[11px] font-medium text-zinc-400">{sub.slug}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditSub(sub)}
                        className="h-8 w-8 p-0 rounded-lg text-zinc-300 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setDeleteSub(sub); setDeleteSubOpen(true); }}
                        className="h-8 w-8 p-0 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {sub.description && (
                    <div className="text-xs text-zinc-500 px-1 pt-2 border-t border-zinc-200/50 leading-relaxed">
                      {sub.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Brands Section */}
      <div className="bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm overflow-hidden mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 border-b border-zinc-100">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2.5 mb-1">
              <Layers className="h-5 w-5 text-purple-500" /> Brands
            </h2>
            <p className="text-zinc-500 text-sm font-medium">
              {brands.length} brand{brands.length === 1 ? '' : 's'} in {category.name}.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {brandsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((key) => (
                <div key={key} className="animate-pulse bg-zinc-50 rounded-xl p-5 border border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-zinc-200 rounded-lg shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-2/3 bg-zinc-200 rounded-md"></div>
                      <div className="h-3 w-1/3 bg-zinc-100 rounded-md"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : brands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 text-center">
              <Layers className="h-10 w-10 text-zinc-300 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 mb-1">No brands yet</h3>
              <p className="text-sm font-medium text-zinc-500">There are no brands associated with this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map((brand) => (
                <div key={brand.id} className="flex flex-col gap-3 bg-zinc-50/50 border border-zinc-200/60 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                      <Layers className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-zinc-900 truncate">{brand.name}</p>
                      <span className="text-[11px] font-medium text-zinc-400">{brand.slug}</span>
                    </div>
                  </div>
                  {brand.description && (
                    <div className="text-xs text-zinc-500 px-1 pt-2 border-t border-zinc-200/50 leading-relaxed">
                      {brand.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== DELETE SUB-CATEGORY CONFIRMATION ===== */}
      <Dialog open={deleteSubOpen} onOpenChange={setDeleteSubOpen}>
        <DialogContent className="sm:max-w-sm rounded-[1.5rem] p-0 overflow-hidden border-zinc-200/60">
          <div className="p-8 text-center space-y-5">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <Trash2 className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-2">Delete Sub-Category?</h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-zinc-700">"{deleteSub?.name}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteSubOpen(false)} className="flex-1 rounded-xl h-11 font-semibold border-zinc-200">
                Cancel
              </Button>
              <Button onClick={handleDeleteSub} disabled={deleteSubSubmitting} className="flex-1 rounded-xl h-11 bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md shadow-red-500/20 active:scale-[0.97]">
                {deleteSubSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                {deleteSubSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== ADD SUB-CATEGORY MODAL ===== */}
      <Dialog open={createSubOpen} onOpenChange={setCreateSubOpen}>
        <DialogContent className="sm:max-w-md rounded-[1.5rem] p-0 overflow-hidden border-zinc-200/60">
          <DialogHeader className="p-6 pb-4 border-b border-zinc-100 bg-zinc-50/50">
            <DialogTitle className="text-xl font-semibold text-zinc-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#00B523]/10 flex items-center justify-center">
                <Layers className="h-5 w-5 text-[#00B523]" />
              </div>
              Add Sub-Category
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-zinc-700 font-semibold text-sm">Sub-Category Name <span className="text-red-500">*</span></Label>
              <Input
                value={subName}
                onChange={(e) => setSubName(sanitizeName(e.target.value))}
                placeholder="e.g. Smartphones"
                className="bg-zinc-50/50 border-zinc-200 h-12 px-4 rounded-xl focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-700 font-semibold text-sm">Description <span className="text-red-500">*</span></Label>
              <Textarea
                value={subDescription}
                onChange={(e) => setSubDescription(e.target.value)}
                placeholder="Brief description for this sub-category..."
                rows={3}
                className="bg-zinc-50/50 border-zinc-200 p-4 rounded-xl focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 shadow-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t border-zinc-100 bg-zinc-50/30 flex gap-3 sm:gap-3">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl h-11 px-5 font-semibold border-zinc-200">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAddSub}
              disabled={subSubmitting || !subName.trim() || !subDescription.trim()}
              className="rounded-xl h-11 px-6 bg-[#00B523] hover:bg-[#009A1D] text-white font-semibold shadow-md shadow-[#00B523]/20 active:scale-[0.97]"
            >
              {subSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {subSubmitting ? "Creating..." : "Create Sub-Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== EDIT SUB-CATEGORY MODAL ===== */}
      <Dialog open={editSubOpen} onOpenChange={setEditSubOpen}>
        <DialogContent className="sm:max-w-md rounded-[1.5rem] p-0 overflow-hidden border-zinc-200/60">
          <DialogHeader className="p-6 pb-4 border-b border-zinc-100 bg-zinc-50/50">
            <DialogTitle className="text-xl font-semibold text-zinc-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Pencil className="h-5 w-5 text-amber-600" />
              </div>
              Edit Sub-Category
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-zinc-700 font-semibold text-sm">Sub-Category Name <span className="text-red-500">*</span></Label>
              <Input
                value={editSubName}
                onChange={(e) => setEditSubName(sanitizeName(e.target.value))}
                placeholder="Sub-category name"
                className="bg-zinc-50/50 border-zinc-200 h-12 px-4 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-700 font-semibold text-sm">Slug</Label>
              <Input
                value={toSlug(editSubName)}
                readOnly
                className="bg-zinc-100 border-zinc-200 h-12 px-4 rounded-xl text-zinc-500 font-mono text-sm shadow-sm cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-700 font-semibold text-sm">Description <span className="text-red-500">*</span></Label>
              <Textarea
                value={editSubDescription}
                onChange={(e) => setEditSubDescription(e.target.value)}
                placeholder="Updated description..."
                rows={3}
                className="bg-zinc-50/50 border-zinc-200 p-4 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t border-zinc-100 bg-zinc-50/30 flex gap-3 sm:gap-3">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl h-11 px-5 font-semibold border-zinc-200">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleEditSub}
              disabled={editSubSubmitting || !editSubName.trim() || !editSubDescription.trim()}
              className="rounded-xl h-11 px-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md shadow-amber-500/20 active:scale-[0.97]"
            >
              {editSubSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
              {editSubSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== EDIT CATEGORY MODAL ===== */}
      <EditCategoryModal
        open={editCategoryOpen}
        onOpenChange={setEditCategoryOpen}
        category={category}
        onSuccess={fetchCategory}
      />

      {/* ===== DELETE CATEGORY CONFIRMATION ===== */}
      <DeleteCategoryModal
        open={deleteCategoryOpen}
        onOpenChange={setDeleteCategoryOpen}
        category={category}
        onSuccess={() => navigate("/dashboard/categories")}
      />
    </div>
  );
};

export default CategoryDetail;
