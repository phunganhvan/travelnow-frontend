import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TextInput from '../../components/atoms/inputs/TextInput';
import Button from '../../components/atoms/Button/Button';
import { post } from '../../services/api';
import { toast } from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { handleSubmit, control } = useForm({
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (values) => {
    try {
      const data = await post('/user/forgot-password', {
        email: values.email
      });

      const message =
        data?.message || 'Nếu email tồn tại, chúng tôi đã gửi mã OTP';
      toast.success(message);

      navigate('/user/forgot-password/verify-otp', {
        state: {
          email: values.email
        }
      });
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 px-4 pt-20">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <h1 className="mb-2 text-xl font-semibold text-slate-900">
          Quên mật khẩu
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Nhập địa chỉ email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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

          <Button type="submit" size="md" className="w-full rounded-xl">
            Gửi mã OTP
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
