const baseUrl = import.meta.env.VITE_API_BASE_URL;

const API_URL = {
  LOGIN: "/v1/customer-merchant/authentication/login",
  MODERATION_QUEUE: "/swap-store/admin/moderation/queue",
  DELIVERY_BOYS: "/swap-store/admin/delivery/exec",
  DELIVERY_ORDERS: "/swap-store/admin/delivery-orders",
  CATEGORIES: "/swap-store/catalog/categories",
  BRANDS: "/swap-store/catalog/brands",
  ADMIN_CATEGORIES: "/swap-store/catalog/admin/categories",
  ADMIN_BRANDS: "/swap-store/catalog/admin/brands",
  ADMIN_SUB_CATEGORIES: "/swap-store/catalog/admin/sub-categories",
  CONDITIONS: "/swap-store/catalog/condition-grades",
  ADMIN_CONDITIONS: "/swap-store/catalog/admin/condition-grades",
  APP_FEATURE_GUIDE: "/swap-store/app-feature-guide",
  APP_FEATURE_GUIDE_UPLOAD: "/swap-store/app-feature-guide/upload-video",
  REJECT_LISTING: (listingId: string) => `/swap-store/admin/listings/${listingId}/reject`,
  APPROVE_MODERATION: (listingId: string) => `/swap-store/moderation/${listingId}/approve`,
};

export { baseUrl, API_URL };
