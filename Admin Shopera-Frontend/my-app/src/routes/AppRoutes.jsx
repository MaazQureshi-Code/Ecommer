// src/routes/AppRoutes.jsx

import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ManageUsersPage from "../pages/admin/ManageUsersPage";
import SellerVerificationPage from "../pages/admin/SellerVerificationPage";
import ManageSellersPage from "../pages/admin/ManageSellersPage";
import ManageProductsPage from "../pages/admin/ManageProductsPage";
import ManageCategoriesPage from "../pages/admin/ManageCategoriesPage";
import ManageOrdersPage from "../pages/admin/ManageOrdersPage";
import ManageCouponsPage from "../pages/admin/ManageCouponsPage";
import ManageReportsPage from "../pages/admin/ManageReportsPage";
import AdminAnalyticsPage from "../pages/admin/AdminAnalyticsPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import ProtectedRoute from "./ProtectedRoute";
import { getAuthenticatedUser } from "../auth/authSession.js";

function RootRedirect() {
  const user = getAuthenticatedUser();
  return <Navigate to={user?.role === "ADMIN" ? "/admin" : "/login"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<ManageUsersPage />} />
        <Route path="/admin/seller-verification" element={<SellerVerificationPage />} />
        <Route path="/admin/sellers" element={<ManageSellersPage />} />
        <Route path="/admin/products" element={<ManageProductsPage />} />
        <Route path="/admin/categories" element={<ManageCategoriesPage />} />
        <Route path="/admin/orders" element={<ManageOrdersPage />} />
        <Route path="/admin/coupons" element={<ManageCouponsPage />} />
        <Route path="/admin/reports" element={<ManageReportsPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default AppRoutes;
