import { useState, useEffect, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Package,
  Calendar,
  IndianRupee,
  Truck,
  User,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Copy,
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

const statusSteps = [
  { key: "unassigned", label: "Unassigned", description: "Order created, awaiting delivery partner assignment" },
  { key: "pending", label: "Pending", description: "Delivery partner assigned, waiting to start" },
  { key: "in_transit", label: "In Transit", description: "Items are being picked up and delivered" },
  { key: "completed", label: "Completed", description: "Swap delivery completed successfully" },
];

const getStepIndex = (status: string) => {
  const idx = statusSteps.findIndex((s) => s.key === status);
  return idx === -1 ? -1 : idx;
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  unassigned: { label: "Unassigned", color: "text-zinc-600", bg: "bg-zinc-100" },
  created: { label: "Created", color: "text-blue-600", bg: "bg-blue-50" },
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50" },
  in_transit: { label: "In Transit", color: "text-indigo-600", bg: "bg-indigo-50" },
  completed: { label: "Completed", color: "text-[#009A1D]", bg: "bg-[#00B523]/10" },
};

const getStatusStyle = (status: string) =>
  statusConfig[status] || { label: status, color: "text-zinc-500", bg: "bg-zinc-50" };

const OptimizedImage = memo(({ src, alt, className }: { src?: string; alt: string; className?: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (error || !src) {
    return (
      <div className={`bg-zinc-50 shrink-0 flex flex-col items-center justify-center text-zinc-400 animate-in fade-in duration-500 overflow-hidden ${className}`}>
        <ImageIcon className="h-1/3 w-1/3 opacity-20" />
      </div>
    );
  }

  return (
    <>
      <div 
        onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
        className={`relative shrink-0 overflow-hidden bg-zinc-100 cursor-pointer group/img ${className}`}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
            <Maximize2 className="h-4 w-4 text-white scale-75 group-hover/img:scale-100 transition-transform duration-300" />
        </div>

        <img
          src={src}
          alt={alt}
          loading="lazy"
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

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_URL.DELIVERY_ORDERS, {
        params: { order_id: id },
      });
      const res = response.data;
      const all: DeliveryOrder[] = res?.data || [];
      const found = all.find((o) => o.id === id);
      setOrder(found || null);
    } catch (err) {
      console.error("Failed to load order:", err);
      toast.error("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm max-w-7xl mx-auto">
        <Loader2 className="h-12 w-12 animate-spin text-[#00B523] mb-5" />
        <p className="text-zinc-500 font-semibold tracking-wide text-lg">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6 bg-zinc-50/50 rounded-[2rem] border-2 border-dashed border-zinc-200 text-center max-w-7xl mx-auto">
        <Package className="h-12 w-12 text-zinc-300 mb-4" />
        <h3 className="text-2xl font-semibold text-zinc-900 mb-2">Order not found</h3>
        <p className="text-zinc-500 font-medium text-base mb-6">The requested order does not exist or has been removed.</p>
        <Button onClick={() => navigate("/dashboard/orders")} variant="outline" className="rounded-xl h-11 px-6 font-semibold">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
      </div>
    );
  }

  const st = getStatusStyle(order.status);
  const currentStep = getStepIndex(order.status);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00B523]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex items-center gap-5">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/orders")}
            className="h-12 w-12 p-0 rounded-2xl border-zinc-200 hover:bg-zinc-100 shrink-0 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-600" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">Order Details</h1>
              <Badge className={`px-3 py-1 text-xs font-semibold rounded-xl border-none ${st.color} ${st.bg}`}>
                {st.label}
              </Badge>
            </div>
            <p className="text-zinc-400 text-sm font-medium font-mono">
              #{order?.id}
            </p>
          </div>
        </div>
      </div>

      {/* Order Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-zinc-500" />
              </div>
              <button
                onClick={() => {
                  if (order?.id) {
                    navigator.clipboard.writeText(order.id);
                    toast.success("Order ID copied");
                  }
                }}
                className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                title="Copy Order ID"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-widest block mb-1">Order ID</span>
            <p className="text-sm font-semibold text-zinc-900 font-mono break-all">{order?.id}</p>
          </div>
        </Card>
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-zinc-500" />
              </div>
            </div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-widest block mb-1">Created</span>
            <p className="text-sm font-semibold text-zinc-900">
              {order?.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: "long" }) : "N/A"}
            </p>
          </div>
        </Card>
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-[#00B523]/10 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-[#00B523]" />
              </div>
            </div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-widest block mb-1">Delivery Fee</span>
            <p className="text-lg font-semibold text-zinc-900">₹{order?.delivery_fee?.toFixed(2)}</p>
          </div>
        </Card>
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <Truck className="h-5 w-5 text-zinc-500" />
              </div>
            </div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-widest block mb-1">Shipping</span>
            <p className="text-sm font-bold text-zinc-900 uppercase tracking-tight">{order?.shipping_options || "Standard"}</p>
          </div>
        </Card>
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-zinc-500" />
              </div>
              <button
                onClick={() => {
                  if (order?.deal_id) {
                    navigator.clipboard.writeText(order.deal_id);
                    toast.success("Deal ID copied");
                  }
                }}
                className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                title="Copy Deal ID"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-widest block mb-1">Deal ID</span>
            <p className="text-sm font-semibold text-zinc-900 font-mono break-all">{order?.deal_id}</p>
          </div>
        </Card>
      </div>

      {/* Swap Items */}
      <div className="bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-zinc-100">
          <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2.5">
            <ArrowUpDown className="h-5 w-5 text-[#00B523]" /> Swap Items
          </h2>
          <p className="text-zinc-500 text-sm font-medium mt-1">Items being exchanged in this swap deal.</p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Maker Item */}
            <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-lg">
                  Maker Item
                </Badge>
                {order?.maker_status && (
                  <Badge className="bg-zinc-100 text-zinc-500 border-none text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-lg">
                    {order?.maker_status}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <OptimizedImage
                  src={order?.maker_listing_media?.[0]}
                  alt={order?.maker_listing_title}
                  className="h-20 w-20 rounded-xl border-2 border-white shadow-md ring-1 ring-zinc-200/50"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-zinc-900 leading-snug">{order?.maker_listing_title}</p>
                  <p className="text-xs text-zinc-400 font-medium mt-1">{order?.maker_listing_media?.length || 0} image(s)</p>
                </div>
              </div>
              {/* Media Grid */}
              {order?.maker_listing_media && order?.maker_listing_media.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                  {order?.maker_listing_media.map((url, i) => (
                    <OptimizedImage
                      key={i}
                      src={url}
                      alt={`Maker item ${i + 1}`}
                      className="h-16 w-16 rounded-lg border border-zinc-200 shadow-sm"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Accepter Item */}
            <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-purple-50 text-purple-600 border-none text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-lg">
                  Accepter Item
                </Badge>
                {order?.acceptor_status && (
                  <Badge className="bg-zinc-100 text-zinc-500 border-none text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-lg">
                    {order?.acceptor_status}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <OptimizedImage
                  src={order?.accepter_listing_media?.[0]}
                  alt={order?.accepter_listing_title}
                  className="h-20 w-20 rounded-xl border-2 border-white shadow-md ring-1 ring-zinc-200/50"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-zinc-900 leading-snug">{order?.accepter_listing_title}</p>
                  <p className="text-xs text-zinc-400 font-medium mt-1">{order?.accepter_listing_media?.length || 0} image(s)</p>
                </div>
              </div>
              {order?.accepter_listing_media && order?.accepter_listing_media.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                  {order?.accepter_listing_media.map((url, i) => (
                    <OptimizedImage
                      key={i}
                      src={url}
                      alt={`Accepter item ${i + 1}`}
                      className="h-16 w-16 rounded-lg border border-zinc-200 shadow-sm"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Partner */}
      <div className="bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-zinc-100">
          <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2.5">
            <Truck className="h-5 w-5 text-[#00B523]" /> Delivery Partner
          </h2>
        </div>
        <div className="p-6 sm:p-8">
          {order?.delivery_exec_id ? (
            <div className="flex items-center gap-5 bg-zinc-50/50 border border-zinc-200/60 rounded-2xl p-5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#00B523]/15 to-[#00B523]/5 flex items-center justify-center ring-1 ring-[#00B523]/20 shadow-inner shrink-0">
                <User className="h-6 w-6 text-[#00B523]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900">Delivery Partner Assigned</p>
                <p className="text-xs text-zinc-400 font-mono font-medium mt-0.5 truncate">ID: {order?.delivery_exec_id}</p>
              </div>
              <Badge className="bg-[#00B523]/10 text-[#009A1D] border-none px-3 py-1.5 text-xs font-semibold rounded-xl shrink-0">
                Assigned
              </Badge>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 text-center">
              <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mb-1">No Delivery Partner Assigned</h3>
              <p className="text-sm font-medium text-zinc-500">A delivery partner has not yet been assigned to this order.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Status Timeline */}
      <div className="bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-zinc-100">
          <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-[#00B523]" /> Order Timeline
          </h2>
          <p className="text-zinc-500 text-sm font-medium mt-1">Track the progress of this delivery order.</p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="relative">
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isFuture = index > currentStep;

              return (
                <div key={step.key} className="flex gap-5 relative">
                  {/* Vertical Line */}
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`absolute left-[19px] top-[40px] w-[2px] h-[calc(100%-16px)] ${isCompleted ? "bg-[#00B523]" : isCurrent ? "bg-gradient-to-b from-[#00B523] to-zinc-200" : "bg-zinc-200"
                        }`}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative z-10 shrink-0">
                    {isCompleted ? (
                      <div className="h-10 w-10 rounded-full bg-[#00B523] flex items-center justify-center shadow-md shadow-[#00B523]/20">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                    ) : isCurrent ? (
                      <div className="h-10 w-10 rounded-full bg-[#00B523]/10 flex items-center justify-center ring-2 ring-[#00B523] shadow-md shadow-[#00B523]/10">
                        <div className="h-3 w-3 rounded-full bg-[#00B523] animate-pulse" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center ring-1 ring-zinc-200">
                        <Circle className="h-4 w-4 text-zinc-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`pb-10 flex-1 min-w-0 ${isFuture ? "opacity-40" : ""}`}>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className={`text-sm font-semibold ${isCurrent ? "text-[#00B523]" : isCompleted ? "text-zinc-900" : "text-zinc-400"}`}>
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <Badge className="bg-[#00B523]/10 text-[#009A1D] border-none text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md">
                          Current
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge className="bg-[#00B523]/10 text-[#009A1D] border-none text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md">
                          Done
                        </Badge>
                      )}
                    </div>
                    <p className={`text-xs font-medium leading-relaxed ${isCurrent ? "text-zinc-600" : isCompleted ? "text-zinc-500" : "text-zinc-300"}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
