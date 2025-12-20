import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Lock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/atoms/Button/Button';
import { post } from '../../services/api';
import { toast } from 'react-hot-toast';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;
  const { handleSubmit, control, watch } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const passwordValue = watch('password');

  const onSubmit = async (values) => {
    if (!email || !otp) {
      toast.error(
        'Thiếu thông tin email hoặc mã OTP. Vui lòng thực hiện lại quy trình quên mật khẩu.'
      );
      navigate('/user/forgot-password');
      return;
    }

    try {
      await post('/user/reset-password', {
        email,
        otp,
        newPassword: values.password
      });

      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
      navigate('/user/login');
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 px-4 pt-20">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <h1 className="mb-2 text-xl font-semibold text-slate-900">
          Đặt lại mật khẩu
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="password"
            control={control}
            rules={{ required: 'Vui lòng nhập mật khẩu mới' }}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-800">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Nhập mật khẩu mới"
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

          <Button type="submit" size="md" className="w-full rounded-xl">
            Lưu mật khẩu mới
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
