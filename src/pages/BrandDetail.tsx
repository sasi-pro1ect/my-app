import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Tag, Layers, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { EditBrandModal } from "@/components/modal/EditBrandModal";
import { DeleteBrandModal, Brand } from "@/components/modal/DeleteBrandModal";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const BrandDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  
  // All Categories needed to map names
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [brandRes, catRes] = await Promise.all([
        axiosInstance.get(API_URL.BRANDS),
        axiosInstance.get(API_URL.CATEGORIES)
      ]);
      const allBrands: Brand[] = Array.isArray(brandRes.data) ? brandRes.data : [];
      const found = allBrands.find((b) => b.id === id);
      setBrand(found || null);

      const allCats: Category[] = Array.isArray(catRes.data?.categories) ? catRes.data?.categories : [];
      setCategories(allCats);
    } catch (err) {
      console.error("Failed to load details:", err);
      toast.error("Failed to load brand details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm max-w-7xl mx-auto">
         <Loader2 className="h-12 w-12 animate-spin text-[#00B523] mb-5" />
         <p className="text-zinc-500 font-semibold tracking-wide text-lg">Loading brand details...</p>
       </div>
     );
  }

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6 bg-zinc-50/50 rounded-[2rem] border-2 border-dashed border-zinc-200 text-center max-w-7xl mx-auto">
        <Tag className="h-12 w-12 text-zinc-300 mb-4" />
        <h3 className="text-2xl font-bold text-zinc-900 mb-2">Brand not found</h3>
        <p className="text-zinc-500 font-medium text-base mb-6">The requested brand does not exist or has been removed.</p>
        <Button onClick={() => navigate("/dashboard/brands")} variant="outline" className="rounded-xl h-11 px-6 font-bold">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Brands
        </Button>
      </div>
    );
  }

  // Get matching category names
  const brandCategories = categories.filter(c => (brand?.category_id || []).includes(c.id));

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00B523]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex items-center gap-5">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/brands")}
            className="h-12 w-12 p-0 rounded-2xl border-zinc-200 hover:bg-zinc-100 shrink-0 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-600" />
          </Button>

          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center text-zinc-700 font-black text-2xl border border-zinc-200/80 shadow-sm shrink-0">
            {getInitials(brand?.name || "")}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{brand?.name}</h1>
              <Badge className="bg-[#00B523]/10 text-[#009A1D] border-none px-3 py-1 font-bold text-sm shadow-sm">
                Registered Brand
              </Badge>
            </div>
            <p className="text-zinc-500 text-sm font-medium">
              View and manage this brand's categories and primary details.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <Button
            onClick={() => setEditOpen(true)}
            variant="outline"
            className="h-11 px-5 border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-100 hover:text-amber-800 rounded-xl font-bold shadow-sm transition-all"
          >
            <Pencil className="h-4 w-4 mr-2" /> Edit Brand
          </Button>
          <Button
            onClick={() => setDeleteOpen(true)}
            variant="outline"
            className="h-11 px-5 border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100 hover:text-red-700 rounded-xl font-bold shadow-sm transition-all"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden md:col-span-1">
          <div className="p-6">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest block mb-2">Description</span>
            <p className="text-[15px] font-medium text-zinc-700 leading-relaxed min-h-[4rem]">
              {brand?.description || "No description provided for this brand."}
            </p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#00B523]/5 to-transparent border border-[#00B523]/20 shadow-sm rounded-2xl overflow-hidden md:col-span-1">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-[#00B523]/10 rounded-xl">
                <Layers className="w-5 h-5 text-[#00B523]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 leading-none mb-1">Associated Categories</h3>
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">{brandCategories.length} Total</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {brandCategories.length > 0 ? brandCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-2.5 px-4 py-2 bg-white border border-[#00B523]/20 shadow-sm rounded-xl hover:border-[#00B523]/40 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[#00B523]" />
                  <span className="text-sm font-bold text-zinc-800">{cat.name}</span>
                </div>
              )) : (
                <div className="w-full flex flex-col items-center justify-center py-6 px-4 bg-white/50 border border-dashed border-zinc-200 rounded-xl">
                    <Tag className="w-6 h-6 text-zinc-300 mb-2" />
                    <span className="text-sm font-medium text-zinc-500">No categories assigned yet</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <EditBrandModal
        open={editOpen}
        onOpenChange={setEditOpen}
        brand={brand}
        onSuccess={fetchData}
      />

      <DeleteBrandModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        brand={brand}
        onSuccess={() => navigate("/dashboard/brands")}
      />
    </div>
  );
};

export default BrandDetail;
