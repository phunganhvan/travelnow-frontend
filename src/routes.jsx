import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout/MainLayout';
import HomePage from './pages/Home/HomePage';
import SearchResultsPage from './pages/Search/SearchResultsPage';
import HotelDetailPage from './pages/Hotel/HotelDetailPage';
import LoginPage from './pages/Auth/LoginPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import OtpPage from './pages/Auth/OtpPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import UserInfoPage from './pages/User/UserInfoPage';
import { useAuth } from './context/AuthContext';

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/user/login" replace />;
  }

  return children;
};

const RoutesConfig = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/hotel/:id" element={<HotelDetailPage />} />
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
      </Route>
    </Routes>
  );
};

export default RoutesConfig;