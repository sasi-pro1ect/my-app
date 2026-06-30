import { useState, useEffect, useMemo, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Eye,
  Calendar,
  ArrowUpDown,
  Truck,
  Clock,
  IndianRupee,
  Search,
  X,
  Copy,
  ArrowRightLeft,
  Loader2,
  Image as ImageIcon,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { ImageViewerModal } from "@/components/ImageViewerModal";

interface DeliveryOrder {
  id: string;
  deal_id: string;
  delivery_exec_id: string | null;
  status: string;
  delivery_fee: number;
  created_at: string;
  maker_status: string | null;
  acceptor_status: string | null;
  maker_listing_title: string;
  maker_listing_media: string[];
  accepter_listing_title: string;
  accepter_listing_media: string[];
  shipping_options: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; ring: string }> = {
  unassigned: { label: "Unassigned", color: "text-zinc-600", bg: "bg-zinc-100", ring: "ring-zinc-200" },
  created: { label: "Created", color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-200" },
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200" },
  in_transit: { label: "In Transit", color: "text-indigo-600", bg: "bg-indigo-50", ring: "ring-indigo-200" },
  completed: { label: "Completed", color: "text-[#009A1D]", bg: "bg-[#00B523]/10", ring: "ring-[#00B523]/30" },
};

const getStatusStyle = (status: string) =>
  statusConfig[status] || { label: status, color: "text-zinc-500", bg: "bg-zinc-50", ring: "ring-zinc-200" };

// Optimized image with lazy loading and fade-in to stop page lag
const OptimizedImage = memo(({ src, alt }: { src?: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (error || !src) {
    return (
      <div className="h-14 w-14 rounded-xl border-2 border-white shadow-md ring-1 ring-zinc-200/50 bg-zinc-50 shrink-0 flex flex-col items-center justify-center text-zinc-400 gap-0.5 animate-in fade-in duration-500">
        <ImageIcon className="h-5 w-5 opacity-30" />
        <span className="text-[8px] font-bold uppercase tracking-tighter opacity-50">No Image</span>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
        className="relative h-14 w-14 rounded-xl border-2 border-white shadow-md ring-1 ring-zinc-200/50 bg-zinc-100 shrink-0 overflow-hidden cursor-pointer group/img"
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <Maximize2 className="h-4 w-4 text-white scale-75 group-hover/img:scale-100 transition-transform duration-300" />
        </div>

        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      <ImageViewerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        src={src}
        alt={alt}
      />
    </>
  );
});

// Extracted card preventing heavy re-renders
const OrderCard = memo(({ order, onNavigate }: { order: DeliveryOrder; onNavigate: (id: string) => void }) => {
  const st = getStatusStyle(order.status);
  return (
    <Card className="bg-white border-zinc-200/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">

          {/* Swap Items Preview */}
          <div className="flex items-center gap-3 shrink-0">
            <OptimizedImage
              src={order?.maker_listing_media?.[0]}
              alt={order?.maker_listing_title || "Maker's item"}
            />
            <div className="flex items-center text-zinc-300">
              <ArrowRightLeft className="h-4 w-4 " />
            </div>
            <OptimizedImage
              src={order?.accepter_listing_media?.[0]}
              alt={order?.accepter_listing_title || "Accepter's item"}
            />
          </div>

          {/* Order Info */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-zinc-900 truncate">
                {order?.maker_listing_title}
              </p>
              <span className="text-xs text-zinc-400 font-medium">⇄</span>
              <p className="text-sm font-semibold text-zinc-700 truncate">
                {order?.accepter_listing_title}
              </p>
            </div>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Package className="h-3.5 w-3.5 shrink-0" />
              <span className="break-all font-mono text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">{order?.id}</span>
              <button
                onClick={() => {
                  if (order?.id) {
                    navigator.clipboard.writeText(order.id);
                    toast.success("Order ID copied");
                  }
                }}
                className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-600 transition-colors shrink-0"
                title="Copy Order ID"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {order?.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : "N/A"}
              </span>
              {order?.delivery_fee && (
                <span className="flex items-center gap-1.5" title="Delivery fee">
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span>Delivery Fee: {order?.delivery_fee?.toFixed(2)}</span>
                </span>
              )}
              {order?.delivery_exec_id && (
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" />
                  Assigned
                </span>
              )}
              {order?.shipping_options && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 rounded-md text-zinc-600 font-bold uppercase text-[9px] tracking-widest border border-zinc-200/50">
                  <Truck className="h-3 w-3" />
                  {order.shipping_options}
                </span>
              )}
            </div>
          </div>

          {/* Status + Action */}
          <div className="flex items-center gap-3 shrink-0">
            <Badge className={`px-3 py-1.5 text-xs font-semibold rounded-xl ring-1 ${st.color} ${st.bg} ${st.ring} border-none`}>
              {st.label}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(order?.id || "")}
              className="h-9 px-4 rounded-xl text-xs font-semibold text-[#00B523] border-[#00B523]/30 hover:bg-[#00B523]/10 hover:text-[#009A1D] transition-colors gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
});

const CurrentOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const observerTarget = useRef(null);

  // Filters
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchOrders = async (pageNum: number, append: boolean = false, resetFilters = false) => {
    if (pageNum === 1) {
      setLoading(true);
      setOrders([]);
    } else {
      setIsFetchingNextPage(true);
    }

    setError("");
    try {
      const params: Record<string, any> = {
        page: pageNum,
        size: 10
      };
      if (!resetFilters) {
        if (filterOrderId.trim()) params.order_id = filterOrderId.trim();
        if (filterDate) params.order_date = filterDate;
      }
      const response = await axiosInstance.get(API_URL.DELIVERY_ORDERS, { params });
      const res = response.data;
      const newList = res?.data || [];

      setOrders(prev => append ? [...prev, ...newList] : newList);
      setHasMore(res?.has_next || false);
      setTotalRecords(res?.total || 0);
    } catch (err) {
      console.error("Failed to load orders:", err);
      if (pageNum === 1) setError("Failed to load delivery orders. Please try again.");
    } finally {
      setLoading(false);
      setIsFetchingNextPage(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, false);
  }, []);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !isFetchingNextPage) {
          setPage(prevPage => {
            const next = prevPage + 1;
            fetchOrders(next, true);
            return next;
          });
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, isFetchingNextPage, filterOrderId, filterDate]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchOrders(1, false);
  };

  const clearFilters = () => {
    setFilterOrderId("");
    setFilterDate("");
    setPage(1);
    fetchOrders(1, false, true);
  };

  const hasFilters = filterOrderId.trim() !== "" || filterDate !== "";

  // Stats
  const stats = useMemo(() => ({
    total: totalRecords,
    unassigned: orders.filter((o) => o.status === "unassigned").length,
    pending: orders.filter((o) => o.status === "pending").length,
    completed: orders.filter((o) => o.status === "completed").length,
  }), [orders, totalRecords]);

  const orderListElements = useMemo(() => {
    return orders.map((order) => (
      <OrderCard key={order.id} order={order} onNavigate={(id) => navigate(`/dashboard/orders/${id}`)} />
    ));
  }, [orders, navigate]);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00B523]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Delivery Orders</h1>
            <Badge className="bg-[#00B523]/10 text-[#009A1D] border-none px-3 py-1 font-semibold text-sm shadow-sm">
              {stats.total} Total
            </Badge>
          </div>
          <p className="text-zinc-500 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
            Track and manage all swap delivery orders in real-time.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: stats.total, icon: Package, color: "text-zinc-700", bg: "bg-zinc-50" },
          { label: "Unassigned", value: stats.unassigned, icon: Clock, color: "text-zinc-600", bg: "bg-zinc-50" },
          { label: "Pending", value: stats.pending, icon: Truck, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Completed", value: stats.completed, icon: Package, color: "text-[#009A1D]", bg: "bg-[#00B523]/10" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-zinc-900">{stat.value}</p>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{stat.label}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" /> Order ID
          </label>
          <Input
            value={filterOrderId}
            onChange={(e) => setFilterOrderId(e.target.value)}
            placeholder="e.g. 1cf04152-be2e-..."
            className="bg-zinc-50/50 border-zinc-200 h-11 px-4 rounded-xl text-sm focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 shadow-sm"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Order Date
          </label>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-zinc-50/50 border-zinc-200 h-11 px-4 rounded-xl text-sm focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleApplyFilters}
            className="h-11 px-5 bg-[#00B523] hover:bg-[#009A1D] text-white rounded-xl font-semibold text-sm shadow-md shadow-[#00B523]/20 active:scale-[0.97] flex items-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4" /> Apply
          </Button>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-11 px-4 rounded-xl font-semibold text-sm border-zinc-200 text-zinc-600 hover:bg-zinc-50 flex items-center gap-1.5"
            >
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((key) => (
            <Card key={key} className="bg-white/60 border-zinc-200/40 shadow-sm rounded-2xl overflow-hidden animate-pulse">
              <div className="p-6 flex items-center gap-5">
                <div className="h-16 w-16 bg-zinc-200 rounded-xl shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/3 bg-zinc-200 rounded-md"></div>
                  <div className="h-3 w-2/3 bg-zinc-100 rounded-md"></div>
                  <div className="h-3 w-1/4 bg-zinc-100 rounded-md"></div>
                </div>
                <div className="h-9 w-20 bg-zinc-200 rounded-xl"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 text-red-600 rounded-[2rem] text-sm font-semibold border border-red-100 text-center shadow-sm">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-6 bg-zinc-50/50 rounded-[2rem] border-2 border-dashed border-zinc-200 text-center">
          <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-zinc-100">
            <Package className="h-10 w-10 text-zinc-300" />
          </div>
          <h3 className="text-2xl font-semibold text-zinc-900 mb-2">No orders found</h3>
          <p className="text-zinc-500 font-medium text-base">
            {hasFilters ? "Try adjusting your filters." : "No delivery orders available yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderListElements}

          {/* Observer target and Loading indicator */}
          <div ref={observerTarget} className="h-24 w-full flex flex-col items-center justify-center gap-4 py-8">
            {isFetchingNextPage && (
              <div className="flex items-center gap-3 text-zinc-500 font-semibold text-sm animate-in fade-in slide-in-from-bottom-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#00B523]" />
                Searching for more orders...
              </div>
            )}
            {!hasMore && orders.length > 0 && (
              <div className="flex flex-col items-center gap-2 opacity-50">
                <div className="h-px w-32 bg-zinc-200" />
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                  End of search results
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentOrders;
