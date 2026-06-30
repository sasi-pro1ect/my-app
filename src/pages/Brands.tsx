import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Tag, Plus, Pencil, Trash2, Eye } from "lucide-react";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { useNavigate } from "react-router-dom";
import { CreateBrandModal } from "@/components/modal/CreateBrandModal";
import { EditBrandModal } from "@/components/modal/EditBrandModal";
import { DeleteBrandModal, Brand } from "@/components/modal/DeleteBrandModal";



const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const Brands = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);

  // Delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.get(API_URL.BRANDS);
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load brands:", err);
      setError("Failed to load brands. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // --- EDIT ---
  const openEdit = (brand: Brand) => {
    setEditBrand(brand);
    setEditOpen(true);
  };



  // --- DELETE ---
  const filtered = brands.filter((b) =>
    b?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00B523]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Brand Directory</h1>
            <Badge className="bg-[#00B523]/10 text-[#009A1D] border-none px-3 py-1 font-semibold text-sm shadow-sm">
              {brands?.length} Registered
            </Badge>
          </div>
          <p className="text-zinc-500 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
            Manage the official brands available in the swap store catalog.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-zinc-50 border border-zinc-200/80 rounded-2xl px-5 py-3.5 shadow-sm transition-all focus-within:ring-4 focus-within:ring-[#00B523]/15 focus-within:border-[#00B523] focus-within:bg-white group hover:shadow-md">
            <Search className="h-5 w-5 text-zinc-400 mr-4 group-hover:text-[#00B523] transition-colors shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands..."
              className="bg-transparent border-none outline-none text-zinc-900 font-semibold text-sm w-[130px] sm:w-[180px] placeholder:text-zinc-400 placeholder:font-medium"
            />
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-[52px] px-5 bg-[#00B523] hover:bg-[#009A1D] text-white rounded-2xl font-semibold text-sm shadow-md shadow-[#00B523]/20 transition-all active:scale-[0.97] flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Add Brand
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((key) => (
            <Card key={key} className="bg-white/60 border-zinc-200/40 shadow-sm rounded-3xl overflow-hidden animate-pulse">
              <div className="p-6 flex items-start gap-4 flex-col">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-14 w-14 bg-zinc-200 rounded-2xl shrink-0"></div>
                  <div className="h-4 w-2/3 bg-zinc-200 rounded-lg"></div>
                </div>
                <div className="w-full h-16 bg-zinc-100 rounded-xl mt-2"></div>
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
            <Tag className="h-10 w-10 text-zinc-300" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 mb-2">No brands found</h3>
          <p className="text-zinc-500 font-medium text-base">
            {searchQuery ? `No brands matching "${searchQuery}".` : "The brand directory is currently empty."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((brand) => {
            const initials = getInitials(brand?.name || "");
            return (
              <Card key={brand?.id} className="bg-white border-zinc-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] overflow-hidden group flex flex-col">
                <div className="p-6 flex-1 flex flex-col relative">

                  {/* Decorative background accent inside card */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-zinc-50 to-transparent -z-10 rounded-bl-full opacity-50"></div>

                  <div className="flex items-start gap-4 mb-5 relative z-10">
                    <div className="h-14 w-14 rounded-[14px] bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center text-zinc-700 font-black text-xl border border-zinc-200/80 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-500 shrink-0 select-none">
                      {initials}
                    </div>
                    <div className="flex-1 mt-1 min-w-0">
                      <p className="font-semibold text-zinc-900 text-lg leading-tight truncate">{brand?.name}</p>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mt-1 block">Registered Brand</span>
                    </div>
                  </div>

                  <div className="flex-1 mb-6 bg-zinc-50/50 p-3.5 rounded-xl border border-zinc-100/50 relative z-10">
                    {brand?.description ? (
                      <p className="text-[13px] text-zinc-600 line-clamp-3 leading-relaxed font-medium" title={brand?.description}>
                        {brand?.description}
                      </p>
                    ) : (
                      <p className="text-[13px] text-zinc-400 italic font-medium leading-relaxed">
                        No supplementary details provided.
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 pt-2 relative z-10 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/brands/${brand?.id}`)}
                      className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-[#00B523] border-[#00B523]/30 bg-[#00B523]/5 hover:bg-[#00B523]/10 hover:text-[#009A1D] transition-colors gap-1.5 shadow-sm"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(brand)}
                      className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-amber-700 border-amber-200/70 bg-amber-50/30 hover:bg-amber-100 hover:text-amber-800 transition-colors gap-1.5 shadow-sm"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setDeleteBrand(brand); setDeleteOpen(true); }}
                      className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-red-600 border-red-200/70 bg-red-50/30 hover:bg-red-100 hover:text-red-700 transition-colors gap-1.5 shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateBrandModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchBrands}
      />

      <EditBrandModal
        open={editOpen}
        onOpenChange={setEditOpen}
        brand={editBrand}
        onSuccess={fetchBrands}
      />

      <DeleteBrandModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        brand={deleteBrand}
        onSuccess={fetchBrands}
      />
    </div>
  );
};

export default Brands;
