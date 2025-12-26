import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import TextInput from '../../components/atoms/inputs/TextInput';
import Button from '../../components/atoms/Button/Button';
import { post } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ADMIN_ROLES = ['admin', 'superadmin', 'manager', 'staff'];

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const { handleSubmit, control } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values) => {
    try {
      const data = await post('/user/login', {
        email: values.email,
        password: values.password
      });

      if (!data?.user || !ADMIN_ROLES.includes(data.user.role)) {
        toast.error('Tài khoản này không có quyền truy cập trang quản trị.');
        return;
      }

      if (data?.token) {
        login(data.token, data.user);
      }

      toast.success('Đăng nhập quản trị thành công');
      navigate('/admin', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/60 p-[1px] shadow-xl shadow-slate-900/40">
        <div className="rounded-2xl bg-slate-950 px-6 py-8 sm:px-8 sm:py-10">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold tracking-[0.25em] text-primary/80">
              TRAVELNOW ADMIN
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Đăng nhập quản trị
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Chỉ dành cho quản trị viên, nhân viên và cộng tác viên hệ thống.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              rules={{ required: 'Vui lòng nhập email quản trị' }}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Email quản trị"
                  placeholder="admin@travelnow.vn"
                  type="email"
                  icon={Mail}
                  error={fieldState.error}
                  {...field}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{ required: 'Vui lòng nhập mật khẩu' }}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-100">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-50 placeholder:text-slate-500 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Nhập mật khẩu quản trị"
                      {...field}
                    />
                  </div>
                  {fieldState.error && (
                    <p className="text-xs text-red-400">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Button
              type="submit"
              size="md"
              className="mt-2 w-full rounded-xl bg-primary hover:bg-primaryDark"
            >
              Đăng nhập quản trị
            </Button>

            <p className="mt-4 text-center text-[11px] text-slate-500">
              Nếu bạn là khách hàng, vui lòng sử dụng trang đăng nhập khách
              hàng tại phần giao diện chính.
            </p>
          </form>

          <p className="mt-6 text-center text-[11px] text-slate-500">
            © 2025 TravelNow Admin. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
