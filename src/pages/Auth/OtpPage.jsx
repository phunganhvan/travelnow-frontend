import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/atoms/Button/Button';
import { post } from '../../services/api';
import { toast } from 'react-hot-toast';

const OtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const { handleSubmit, control } = useForm({
    defaultValues: {
      otp: ''
    }
  });

  const onSubmit = async (values) => {
    if (!email) {
      toast.error(
        'Thiếu thông tin email. Vui lòng thực hiện lại bước quên mật khẩu.'
      );
      navigate('/user/forgot-password');
      return;
    }

    try {
      await post('/user/forgot-password/verify-otp', {
        email,
        otp: values.otp
      });

      toast.success('Xác thực OTP thành công. Vui lòng đặt lại mật khẩu.');

      navigate('/user/forgot-password/reset-password', {
        state: {
          email,
          otp: values.otp
        }
      });
    } catch (error) {
      toast.error(error.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 px-4 pt-20">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <h1 className="mb-2 text-xl font-semibold text-slate-900">
          Nhập mã OTP
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Nhập mã OTP gồm 6 chữ số đã được gửi đến email của bạn.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="otp"
            control={control}
            rules={{ required: 'Vui lòng nhập mã OTP' }}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-800">
                  Mã OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-lg tracking-[0.5em] text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="••••••"
                  {...field}
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <Button type="submit" size="md" className="w-full rounded-xl">
            Xác nhận
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OtpPage;
