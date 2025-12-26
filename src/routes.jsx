import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout/MainLayout';
import HomePage from './pages/Home/HomePage';
import SearchResultsPage from './pages/Search/SearchResultsPage';
import HotelDetailPage from './pages/Hotel/HotelDetailPage';
import HotelCheckoutPage from './pages/Hotel/HotelCheckoutPage';
import LoginPage from './pages/Auth/LoginPage';
import AdminLoginPage from './pages/Auth/AdminLoginPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import OtpPage from './pages/Auth/OtpPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import UserInfoPage from './pages/User/UserInfoPage';
import MyBookingsPage from './pages/User/MyBookingsPage';
import BookingDetailPage from './pages/User/BookingDetailPage';
import PromotionsPage from './pages/Promotions/PromotionsPage';
import { useAuth } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout/AdminLayout';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminHotelsPage from './pages/Admin/AdminHotelsPage';
import AdminHotelDetailPage from './pages/Admin/AdminHotelDetailPage';
import AdminHotelEditPage from './pages/Admin/AdminHotelEditPage';
import AdminVouchersPage from './pages/Admin/AdminVouchersPage';
import AdminBookingsPage from './pages/Admin/AdminBookingsPage';
import AdminAnalyticsPage from './pages/Admin/AdminAnalyticsPage';

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/user/login" replace />;
  }

  return children;
};

const RequireRoles = ({ roles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

const RoutesConfig = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/vouchers" element={<PromotionsPage />} />
        <Route path="/hotel/:id" element={<HotelDetailPage />} />
        <Route
          path="/hotel/:id/checkout"
          element={(
            <RequireAuth>
              <HotelCheckoutPage />
            </RequireAuth>
          )}
        />
        <Route path="/user/login" element={<LoginPage />} />
        <Route path="/user/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/user/forgot-password/verify-otp"
          element={<OtpPage />}
        />
        <Route
          path="/user/forgot-password/reset-password"
          element={<ResetPasswordPage />}
        />
        <Route
          path="/user/info"
          element={(
            <RequireAuth>
              <UserInfoPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/user/bookings"
          element={(
            <RequireAuth>
              <MyBookingsPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/user/bookings/:id"
          element={(
            <RequireAuth>
              <BookingDetailPage />
            </RequireAuth>
          )}
        />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={(
          <RequireRoles roles={["superadmin", "admin", "manager", "staff"]}>
            <AdminLayout />
          </RequireRoles>
        )}
      >
        <Route index element={<AdminDashboardPage />} />
        <Route
          path="users"
          element={(
            <RequireRoles roles={["superadmin", "admin"]}>
              <AdminUsersPage />
            </RequireRoles>
          )}
        />
        <Route path="hotels" element={<AdminHotelsPage />} />
        <Route path="hotels/:id" element={<AdminHotelDetailPage />} />
        <Route path="hotels/:id/edit" element={<AdminHotelEditPage />} />
        <Route path="vouchers" element={<AdminVouchersPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
      </Route>
    </Routes>
  );
};

export default RoutesConfig;