import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const linkBaseClasses =
  'block px-4 py-2 rounded-md text-sm font-medium transition-colors';

function navLinkClassName({ isActive }) {
  return isActive
    ? `${linkBaseClasses} bg-blue-600 text-white`
    : `${linkBaseClasses} text-gray-200 hover:bg-gray-700 hover:text-white`;
}

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    navigate('/user/login');
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="px-4 py-4 border-b border-gray-800">
          <h1 className="text-xl font-semibold">TravelNow Admin</h1>
          {user && (
            <p className="text-xs text-gray-400 mt-1">
              Xin chào, {user.fullName || user.email}
            </p>
          )}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <NavLink to="/admin" end className={navLinkClassName}>
            Tổng quan
          </NavLink>
          {(user?.role === 'superadmin' || user?.role === 'admin') && (
            <NavLink to="/admin/users" className={navLinkClassName}>
              Quản lý người dùng
            </NavLink>
          )}
          <NavLink to="/admin/hotels" className={navLinkClassName}>
            Quản lý khách sạn
          </NavLink>
          <NavLink to="/admin/vouchers" className={navLinkClassName}>
            Quản lý ưu đãi
          </NavLink>
          <NavLink to="/admin/bookings" className={navLinkClassName}>
            Quản lý đặt phòng
          </NavLink>
        </nav>
        <div className="px-4 py-4 border-t border-gray-800 text-xs text-gray-400">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left text-red-400 hover:text-red-300"
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
