import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Approvals from "./pages/Approvals";
import CurrentOrders from "./pages/CurrentOrders";
import DeliveryBoys from "./pages/DeliveryBoys";
import CatalogueCreate from "./pages/CatalogueCreate";
import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import CategoryDetail from "./pages/CategoryDetail";
import BrandDetail from "./pages/BrandDetail";
import ConditionGrades from "./pages/ConditionGrades";
import OrderDetail from "./pages/OrderDetail";
import NotFound from "./pages/NotFound";
import AppFeatureList from "./pages/AppFeatureGuide/AppFeatureList";
import AppFeatureDetail from "./pages/AppFeatureGuide/AppFeatureDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="orders" element={<CurrentOrders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="delivery-boys" element={<DeliveryBoys />} />
            <Route path="catalogue" element={<CatalogueCreate />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/:id" element={<CategoryDetail />} />
            <Route path="brands" element={<Brands />} />
            <Route path="brands/:id" element={<BrandDetail />} />
            <Route path="conditions" element={<ConditionGrades />} />
            <Route path="app-feature-guide" element={<AppFeatureList />} />
            <Route path="app-feature-guide/:sectionId" element={<AppFeatureDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
