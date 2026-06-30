import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Users, Package, Activity, AlertCircle, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import axiosInstance from "@/services/axios.instance";

interface DashboardData {
  orders: {
    total: number;
    completed: number;
  };
  delivery_agents: {
    total: number;
    active: number;
  };
  listings: {
    total: number;
    by_status: {
      pending_moderation: number;
      approved: number;
      rejected: number;
      pending: number;
      draft: number;
      removed: number;
    };
  };
}

const COLORS = {
  approved: '#10b981', // emerald-500
  pending_moderation: '#f59e0b', // amber-500
  rejected: '#ef4444', // red-500
  pending: '#3b82f6', // blue-500
  draft: '#6b7280', // gray-500
  removed: '#000000', // black
};

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/swap-store/admin/dashboard');
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard metrics. Please check your connection or try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex bg-white/40 backdrop-blur-md h-[75vh] rounded-3xl border border-zinc-100 shadow-sm items-center justify-center m-4">
        <div className="flex flex-col items-center gap-5 text-zinc-500">
          <div className="relative flex justify-center items-center">
            <div className="absolute animate-ping w-12 h-12 rounded-full bg-emerald-100 opacity-75"></div>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 relative z-10"></div>
          </div>
          <p className="font-semibold text-zinc-600 animate-pulse tracking-wide">Synchronizing Store Operations...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[75vh] items-center justify-center m-4">
        <div className="bg-red-50/80 backdrop-blur text-red-600 p-10 rounded-3xl flex flex-col items-center max-w-md text-center border border-red-100 shadow-xl">
          <div className="p-4 bg-red-100 rounded-full mb-6 relative">
            <AlertCircle className="w-10 h-10 text-red-600" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white animate-pulse" />
          </div>
          <h3 className="text-2xl font-semibold mb-3 tracking-tight">System Outage</h3>
          <p className="text-[15px] font-medium opacity-80 leading-relaxed">{error || "Could not retrieve swap metrics. Our servers might be taking a break."}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Swap Orders",
      value: data?.orders?.total?.toString(),
      icon: ShoppingCart,
      change: `${data?.orders?.completed} successfully fulfilled`,
      indicator: CheckCircle2,
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 shadow-sm"
    },
    {
      label: "Inventory Database",
      value: data?.listings?.total?.toString(),
      icon: Package,
      change: `${data?.listings?.by_status?.approved} items verified & live`,
      indicator: CheckCircle2,
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 shadow-sm"
    },
    {
      label: "Field Agents",
      value: data?.delivery_agents?.total?.toString(),
      icon: Users,
      change: `${data?.delivery_agents?.active} currently on duty`,
      indicator: Clock,
      color: "text-indigo-700",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      iconBg: "bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200 shadow-sm"
    },
    {
      label: "Moderation Queue",
      value: data?.listings?.by_status?.pending_moderation?.toString(),
      icon: Activity,
      change: "Items awaiting review",
      indicator: AlertCircle,
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      iconBg: "bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 shadow-sm"
    },
  ];

  const pieData = [
    { name: 'Approved', value: data?.listings?.by_status?.approved, color: COLORS.approved },
    { name: 'Pending Mod', value: data?.listings?.by_status?.pending_moderation, color: COLORS.pending_moderation },
    { name: 'Rejected', value: data?.listings?.by_status?.rejected, color: COLORS.rejected },
    { name: 'Pending', value: data?.listings?.by_status?.pending, color: COLORS.pending },
    { name: 'Draft', value: data?.listings?.by_status?.draft, color: COLORS.draft },
    { name: 'Removed', value: data?.listings?.by_status?.removed, color: COLORS.removed },
  ].filter(item => item.value > 0);

  const completionData = [
    {
      name: "Fulfillment Status",
      Total: data?.orders?.total,
      Completed: data?.orders?.completed,
    },
  ];

  const agentActivityData = [
    {
      name: "Workforce Availability",
      Total: data?.delivery_agents?.total,
      Active: data?.delivery_agents?.active,
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl shadow-2xl border border-zinc-100/60 p-5 rounded-2xl min-w-[180px]">
          <p className="text-[13px] font-semibold text-zinc-800 mb-3 border-b border-zinc-100 pb-2 uppercase tracking-wide">{label || payload[0].payload.name}</p>
          <div className="space-y-2.5">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm font-semibold flex items-center justify-between gap-6" style={{ color: entry.color || entry.payload.color || '#3f3f46' }}>
                <span className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.payload.color || '#3f3f46' }}></span>
                  {entry.name}
                </span>
                <span className="text-zinc-900">{entry.value}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-12 pt-2 px-2 sm:px-0">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Console
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-2 font-sans drop-shadow-sm">
            Lilo Swap Operations
          </h1>
          <p className="text-zinc-500 text-[15px] max-w-2xl font-medium leading-relaxed">
            Your command center for overseeing swap fulfillment, local inventory moderation, and field agent logistics.
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200/60 rounded-xl text-sm font-semibold text-emerald-800 shadow-inner">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Metrics Synced Successfully
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-white border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[24px] overflow-hidden group relative">
            <div className={`absolute inset-0 bg-gradient-to-br from-white via-white to-${stat.bgColor.split('-')[1]}-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10 p-6">
              <CardTitle className="text-[13px] font-semibold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-700 transition-colors">
                {stat.label}
              </CardTitle>
              <div className={`p-3 ${stat.iconBg} rounded-[16px] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 px-6 pb-6">
              <div className="text-[2.75rem] leading-none font-bold text-zinc-900 mb-4 tracking-tighter">
                {stat.value}
              </div>
              <div className={`inline-flex items-center gap-2 ${stat.color} text-xs font-semibold ${stat.bgColor} px-3.5 py-2 rounded-xl w-full border border-white shadow-sm`}>
                <stat.indicator className="w-3.5 h-3.5 opacity-80" />
                <span className="truncate">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="col-span-1 xl:col-span-1 bg-white border-zinc-100 shadow-sm rounded-[24px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-zinc-50 bg-gradient-to-r from-zinc-50/80 to-transparent py-5 px-6">
            <CardTitle className="text-[16px] font-semibold text-zinc-800 flex items-center gap-2.5">
              <div className="p-1.5 bg-zinc-100 rounded-lg">
                <Package className="w-4 h-4 text-zinc-600" />
              </div>
              Inventory Moderation Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 min-h-[360px] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(#f4f4f5_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={115}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-sm hover:opacity-90 transition-opacity" />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={48}
                    iconType="circle"
                    formatter={(value) => <span className="text-[13px] font-semibold text-zinc-600 pl-1.5">{value}</span>}
                  />

                  {/* Center Text inside Donut */}
                  <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-zinc-400 text-xs font-bold uppercase tracking-widest">
                    Total
                  </text>
                  <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-zinc-900 text-3xl font-bold">
                    {data?.listings?.total}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-400">
                <Package className="w-16 h-16 mb-4 opacity-10" />
                <span className="text-[15px] font-semibold">No listing data available</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 xl:col-span-2 bg-white border-zinc-100 shadow-sm rounded-[24px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-zinc-50 bg-gradient-to-r from-zinc-50/80 to-transparent py-5 px-6">
            <CardTitle className="text-[16px] font-semibold text-zinc-800 flex items-center gap-2.5">
              <div className="p-1.5 bg-zinc-100 rounded-lg">
                <Activity className="w-4 h-4 text-zinc-600" />
              </div>
              Fulfillment & Field Logistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 min-h-[360px] relative">
            <div className="absolute inset-0 bg-[radial-gradient(#f4f4f5_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

            <div className="h-[320px] w-full flex flex-col md:flex-row gap-10 md:gap-6 relative z-10">
              <div className="flex-1 w-full h-full bg-slate-50/30 rounded-2xl p-4 border border-zinc-100/50">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={completionData}
                    margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E4E4E7" opacity={0.6} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 13, fontWeight: 700 }} dy={12} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }} />
                    <RechartsTooltip cursor={{ fill: '#F4F4F5', opacity: 0.4 }} content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '24px' }} formatter={(value) => <span className="text-[13px] font-semibold text-zinc-700 pl-1">{value}</span>} />
                    <Bar dataKey="Total" fill="#E4E4E7" radius={[8, 8, 8, 8]} barSize={56} />
                    <Bar dataKey="Completed" fill="#2563EB" radius={[8, 8, 8, 8]} barSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 w-full h-full bg-slate-50/30 rounded-2xl p-4 border border-zinc-100/50">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={agentActivityData}
                    margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E4E4E7" opacity={0.6} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 13, fontWeight: 700 }} dy={12} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }} />
                    <RechartsTooltip cursor={{ fill: '#F4F4F5', opacity: 0.4 }} content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '24px' }} formatter={(value) => <span className="text-[13px] font-semibold text-zinc-700 pl-1">{value}</span>} />
                    <Bar dataKey="Total" fill="#E4E4E7" radius={[8, 8, 8, 8]} barSize={56} />
                    <Bar dataKey="Active" fill="#059669" radius={[8, 8, 8, 8]} barSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
