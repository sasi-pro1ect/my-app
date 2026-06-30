import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Loader2, Search, Layers, Calendar, Plus, Pencil, Trash2, Eye, Image as ImageIcon, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { EditCategoryModal } from "@/components/modal/EditCategoryModal";
import { CreateCategoryModal } from "@/components/modal/CreateCategoryModal";
import { DeleteCategoryModal } from "@/components/modal/DeleteCategoryModal";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

const toSlug = (name: string) =>
  name.toLowerCase().replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);

  // Delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.get(API_URL.CATEGORIES);
      setCategories(Array.isArray(data?.categories) ? data?.categories : []);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- EDIT ---
  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setEditOpen(true);
  };

  // --- DELETE ---
  const openDelete = (cat: Category) => { setDeleteCat(cat); setDeleteOpen(true); };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00B523]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Categories</h1>
            <Badge className="bg-[#00B523]/10 text-[#009A1D] border-none px-3 py-1 font-semibold text-sm shadow-sm">
              {categories.length} Total
            </Badge>
          </div>
          <p className="text-zinc-500 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
            Browse and manage your product categories for the swap store catalogue.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-zinc-50 border border-zinc-200/80 rounded-2xl px-5 py-3.5 shadow-sm transition-all focus-within:ring-4 focus-within:ring-[#00B523]/15 focus-within:border-[#00B523] focus-within:bg-white group hover:shadow-md">
            <Search className="h-5 w-5 text-zinc-400 mr-4 group-hover:text-[#00B523] transition-colors shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="bg-transparent border-none outline-none text-zinc-900 font-semibold text-sm w-[130px] sm:w-[180px] placeholder:text-zinc-400 placeholder:font-medium"
            />
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-[52px] px-5 bg-[#00B523] hover:bg-[#009A1D] text-white rounded-2xl font-semibold text-sm shadow-md shadow-[#00B523]/20 transition-all active:scale-[0.97] flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Add Category
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <Card key={key} className="bg-white/60 border-zinc-200/40 shadow-sm rounded-2xl overflow-hidden animate-pulse">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-zinc-200 rounded-2xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-2/3 bg-zinc-200 rounded-lg"></div>
                    <div className="h-3 w-1/3 bg-zinc-100 rounded-md"></div>
                  </div>
                </div>
                <div className="h-3 w-1/2 bg-zinc-100 rounded-md"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 text-red-600 rounded-[2rem] text-sm font-semibold border border-red-100 text-center shadow-sm">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-6 bg-zinc-50/50 rounded-[2rem] border-2 border-dashed border-zinc-200 text-center">
          <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-zinc-100">
            <Layers className="h-10 w-10 text-zinc-300" />
          </div>
          <h3 className="text-2xl font-semibold text-zinc-900 mb-2">No categories found</h3>
          <p className="text-zinc-500 font-medium text-base">
            {searchQuery ? `No categories matching "${searchQuery}".` : "The category list is empty."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((cat) => (
            <Card key={cat.id} className="bg-white border-zinc-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl overflow-hidden group">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="h-12 w-12 rounded-2xl object-cover ring-1 ring-zinc-200 shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#00B523]/10 to-[#00B523]/5 flex items-center justify-center text-[#00B523] font-semibold text-lg ring-1 ring-[#00B523]/20 shadow-inner group-hover:scale-110 transition-transform duration-500 shrink-0">
                      <Layers className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-zinc-900 text-lg leading-tight truncate">{cat.name}</p>
                    <span className="text-xs font-medium text-zinc-400 tracking-wide">{cat.slug}</span>
                  </div>
                </div>
                {/* {cat.description && (
                  <p className="text-sm text-zinc-500 mb-4 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )} */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium mb-5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(cat.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-zinc-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/categories/${cat.id}`)}
                    className="flex-1 h-9 rounded-xl text-xs font-semibold text-[#00B523] border-[#00B523]/30 hover:bg-[#00B523]/10 hover:text-[#009A1D] transition-colors gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(cat)}
                    className="flex-1 h-9 rounded-xl text-xs font-semibold text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 transition-colors gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDelete(cat)}
                    className="flex-1 h-9 rounded-xl text-xs font-semibold text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ===== CREATE MODAL ===== */}
      <CreateCategoryModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchCategories}
      />

      {/* ===== EDIT MODAL ===== */}
      <EditCategoryModal
        open={editOpen}
        onOpenChange={setEditOpen}
        category={editCat}
        onSuccess={fetchCategories}
      />

      {/* ===== DELETE CONFIRMATION ===== */}
      <DeleteCategoryModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={deleteCat}
        onSuccess={fetchCategories}
      />
    </div>
  );
};

export default Categories;
