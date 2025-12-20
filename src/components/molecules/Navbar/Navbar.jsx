import React from 'react';
import { LogIn, LogOut, Menu, User as UserIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../atoms/Button/Button';
import IconButton from '../../atoms/IconButton/IconButton';
import { useAuth } from '../../../context/AuthContext';

const NavBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const navLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Khách sạn', path: '/search' },
    { label: 'Chuyến đi của tôi', path: '/user/bookings' },
    { label: 'Khuyến mãi', path: '/vouchers' }
  ];
  const location = useLocation();
  const authPaths = [
    '/user/login',
    '/user/forgot-password',
    '/user/forgot-password/verify-otp',
    '/user/forgot-password/reset-password'
  ];
  const isAuthPage = authPaths.some((path) => location.pathname.startsWith(path));

  // Xác định mục menu đang active theo đường dẫn hiện tại
  let activeNav = null;
  if (!location.pathname.startsWith('/user')) {
    if (location.pathname === '/') {
      activeNav = 'Trang chủ';
    } else if (location.pathname.startsWith('/search')) {
      activeNav = 'Khách sạn';
    } else if (location.pathname.startsWith('/trips')) {
      activeNav = 'Chuyến đi của tôi';
    } else if (location.pathname.startsWith('/deals')) {
      activeNav = 'Khuyến mãi';
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-transparent">
      <div className="app-container py-2">
        <div className="flex items-center justify-between rounded-full bg-white px-5 py-2 shadow-sm">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/90 text-white shadow-sm">
              <span className="text-base font-bold">T</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              TravelNow
            </span>
          </Link>

          {/* Desktop nav (ẩn trên trang auth) */}
          {!isAuthPage && (
            <nav className="hidden items-center gap-8 text-xs font-medium text-slate-500 md:flex">
              {navLinks.map(({ label, path }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(path)}
                  className="relative transition-colors hover:text-slate-900"
                >
                  {label}
                  {label === activeNav && (
                    <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </nav>
          )}

          {/* Actions */}
          <div className="hidden items-center gap-4 text-xs md:flex">
            {isAuthPage ? (
              <>
                <button className="text-slate-500 hover:text-slate-800">
                  Hỗ trợ
                </button>
                <button className="text-slate-500 hover:text-slate-800">
                  Tiếng Việt
                </button>
              </>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="hidden text-right text-[10px] leading-tight text-slate-400 md:block">
                  <p>Xin chào,</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/user/info')}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 hover:border-primary/60 hover:bg-primary/5"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/90 text-[11px] font-semibold text-white">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      (user.fullName || user.email || 'U')
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </span>
                  <span className="text-xs font-medium">
                    {user.fullName || user.email}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="text-[10px] font-medium text-slate-400 hover:text-red-500"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link to="/user/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 hover:border-primary hover:bg-primary hover:text-white"
                >
                  <LogIn size={14} className="mr-1" />
                  Đăng nhập / Đăng ký
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu */}
          <div className="flex md:hidden">
            <IconButton className="border-slate-200 bg-white text-slate-700">
              <Menu size={20} />
            </IconButton>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;