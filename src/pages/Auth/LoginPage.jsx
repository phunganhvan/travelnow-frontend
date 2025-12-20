import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Mail, Lock, Eye } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import TextInput from '../../components/atoms/inputs/TextInput';
import Button from '../../components/atoms/Button/Button';
import { post } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo = location.state?.redirectTo || null;
  const bookingPayload = location.state?.bookingPayload || null;

  const { handleSubmit, control, watch, reset } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const passwordValue = watch('password');

  const onSubmit = async (values) => {
    try {
      if (activeTab === 'login') {
        const data = await post('/user/login', {
          email: values.email,
          password: values.password
        });
        if (data?.token) {
          login(data.token, data.user);
        }

        toast.success('Đăng nhập thành công');
        if (redirectTo) {
          navigate(redirectTo, { replace: true, state: bookingPayload });
        } else {
          navigate('/');
        }
      } else {
        await post('/user/register', {
          fullName: values.fullName,
          email: values.email,
          password: values.password
        });

        toast.success('Đăng ký thành công, vui lòng đăng nhập');
        setActiveTab('login');
        reset({
          fullName: '',
          email: values.email,
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 px-4 pt-20">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card sm:p-8">
        {/* Tabs */}
        <div className="mb-6 flex border-b border-slate-200 text-sm font-medium text-slate-500">
          <button
            type="button"
            className={`relative flex-1 pb-2 text-center transition-colors ${
              activeTab === 'login'
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Đăng nhập
            {activeTab === 'login' && (
              <span className="absolute inset-x-0 -bottom-[1px] mx-auto h-0.5 w-20 rounded-full bg-primary" />
            )}
          </button>
          <button
            type="button"
            className={`relative flex-1 pb-2 text-center transition-colors ${
              activeTab === 'register'
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('register')}
          >
            Đăng ký
            {activeTab === 'register' && (
              <span className="absolute inset-x-0 -bottom-[1px] mx-auto h-0.5 w-20 rounded-full bg-primary" />
            )}
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {activeTab === 'register' && (
            <Controller
              name="fullName"
              control={control}
              rules={{ required: 'Vui lòng nhập họ và tên' }}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Họ và tên"
                  placeholder="Nguyễn Văn A"
                  error={fieldState.error}
                  {...field}
                />
              )}
            />
          )}

          <Controller
            name="email"
            control={control}
            rules={{ required: 'Vui lòng nhập email' }}
            render={({ field, fieldState }) => (
              <TextInput
                label="Email"
                placeholder="nhapemail@vidu.com"
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
                <label className="text-sm font-medium text-slate-800">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Nhập mật khẩu"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    tabIndex={-1}
                  >
                    <Eye size={18} />
                  </button>
                </div>
                {fieldState.error && (
                  <p className="text-xs text-red-500">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          {activeTab === 'register' && (
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: 'Vui lòng nhập lại mật khẩu',
                validate: (value) =>
                  value === passwordValue || 'Mật khẩu không khớp'
              }}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-800">
                    Nhập lại mật khẩu
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Nhập lại mật khẩu"
                      {...field}
                    />
                  </div>
                  {fieldState.error && (
                    <p className="text-xs text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          )}

          {activeTab === 'login' && (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span />
              <Link
                to="/user/forgot-password"
                className="font-semibold text-primary hover:text-primaryDark"
              >
                Quên mật khẩu?
              </Link>
            </div>
          )}

          <Button
            type="submit"
            size="md"
            className="mt-1 w-full rounded-xl"
          >
            {activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </Button>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>
              HOẶC {activeTab === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'} VỚI
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Facebook
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          © 2025 TravelNow. Đã đăng ký bản quyền.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
