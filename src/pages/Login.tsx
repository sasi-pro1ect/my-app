import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, CheckCircle2, TrendingUp, Package, Users } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_URL.LOGIN, {
        username: email,
        password: password,
        totp: totp,
        enable_chat: true,
        userType: "WEB",
      });

      if (response.data && (response.data.access_token || response.data.token)) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("auth_token", response.data.access_token || response.data.token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        localStorage.setItem("customer_id", response.data.customer_id);

        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        setError("Invalid response from server");
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || "Please enter valid credentials";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-50/50">
      {/* Left Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-[380px] animate-fade-in z-10">
          <div className="mb-8 text-left">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-zinc-100 p-2 rounded-xl border border-zinc-200 shadow-sm">
                <img src="/favicon.png" alt="Lilo" className="h-6 w-6" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-zinc-900">Lilo Backoffice</span>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-zinc-900 tracking-tight">Welcome back 👋</h1>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Sign in to manage swaps, monitor inventory, and oversee store operations in one unified console.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700 font-medium text-sm">Email or Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="admin@lilo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-50/50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-11 px-4 rounded-xl focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 transition-all shadow-sm text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" title="Password" className="text-zinc-700 font-medium text-sm">Password</Label>
                <button type="button" className="text-[#00B523] text-xs font-medium hover:text-[#009A1D] transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-50/50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-11 px-4 pr-12 rounded-xl focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 transition-all shadow-sm text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-zinc-700 font-medium text-sm">Security Code (TOTP)</Label>
              <InputOTP
                maxLength={6}
                value={totp}
                onChange={(v) => setTotp(v)}
                className="w-full"
              >
                <InputOTPGroup className="flex justify-between w-full gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="w-12 h-12 sm:w-12 sm:h-12 bg-zinc-50/50 border-zinc-200 text-lg font-semibold rounded-xl focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 text-zinc-900 shadow-sm transition-all"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold bg-[#00B523] hover:bg-[#009A1D] text-white rounded-xl transition-all shadow-lg shadow-[#00B523]/20 hover:shadow-xl hover:shadow-[#00B523]/30 hover:-translate-y-0.5 active:scale-[0.98] border-none"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Access Console"}
            </Button>
          </form>

          <p className="mt-8 text-zinc-400 text-xs font-medium text-center">
            Streamlined operations for the circular economy.
          </p>
        </div>
      </div>

      {/* Right Side: Hero Section & Stats */}
      <div className="hidden lg:flex w-1/2 flex-col p-12 bg-zinc-50/50 relative overflow-hidden justify-center border-l border-zinc-200/60">
        {/* Animated Background Gradients & Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#00B523]/10 to-transparent rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#00B523]/5 to-transparent rounded-full blur-[80px] -ml-32 -mb-32" />

        <div className="relative z-10 space-y-10 max-w-xl px-4 xl:px-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-xs font-medium text-zinc-600 shadow-sm mb-5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B523] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00B523]"></span>
              </span>
              System Live
            </div>

            <h2 className="text-3xl lg:text-3xl font-bold leading-[1.1] tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 to-zinc-600">
              Empowering Smart Swap Operations.
            </h2>
            <p className="text-base text-zinc-500 leading-relaxed max-w-md">
              Real-time monitoring of item conditions, inventory health, and operational efficiency across the entire Lilo ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/90 border-zinc-200/60 backdrop-blur-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-zinc-500 text-xs font-semibold tracking-wide uppercase">Daily Swaps</span>
                  <div className="p-2 bg-[#00B523]/10 rounded-md">
                    <TrendingUp className="text-[#00B523]" size={16} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-zinc-900 mb-2">1,240</div>
                <div className="inline-flex items-center gap-1 text-[#00B523] text-xs font-semibold bg-[#00B523]/5 px-2 py-0.5 rounded">
                  ↑ 12% today
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 border-zinc-200/60 backdrop-blur-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-zinc-500 text-xs font-semibold tracking-wide uppercase">Inventory Health</span>
                  <div className="p-2 bg-[#00B523]/10 rounded-md">
                    <CheckCircle2 className="text-[#00B523]" size={16} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-zinc-900 mb-2">99.1%</div>
                <div className="text-zinc-500 text-xs font-medium">Verified Quality</div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 border-zinc-200/60 backdrop-blur-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-zinc-500 text-xs font-semibold tracking-wide uppercase">Pending Swaps</span>
                  <div className="p-2 bg-[#00B523]/10 rounded-md">
                    <Package className="text-[#00B523]" size={16} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-zinc-900 mb-2">32</div>
                <div className="text-zinc-500 text-xs font-medium">Avg. 8m Processing</div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 border-zinc-200/60 backdrop-blur-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-zinc-500 text-xs font-semibold tracking-wide uppercase">Active Stores</span>
                  <div className="p-2 bg-zinc-100 rounded-md">
                    <Users className="text-zinc-600" size={16} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-zinc-900 mb-2">12</div>
                <div className="text-zinc-500 text-xs font-medium">Global Locations</div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 rounded-xl bg-white/60 border border-zinc-200/60 shadow-sm backdrop-blur-md flex items-start gap-3">
            <div className="h-1.5 w-1.5 mt-1.5 rounded-full bg-[#00B523] shrink-0" />
            <p className="text-zinc-600 text-xs font-medium leading-relaxed">
              <strong className="text-zinc-900 font-semibold">System updated:</strong> Inventory and swap algorithms refreshed for optimized store operations. View latest patch notes in dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
