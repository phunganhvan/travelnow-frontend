import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import TextInput from '../../components/atoms/inputs/TextInput';
import Button from '../../components/atoms/Button/Button';
import { get, put, post } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useImagePreview } from '../../hooks/useImagePreview';
import { toast } from 'react-hot-toast';

const UserInfoPage = () => {
  const { user, setUser } = useAuth();
  const {
    file: avatarFile,
    previewUrl: avatarPreviewUrl,
    onFileChange: onAvatarChange,
    clearImage: clearAvatar
  } = useImagePreview();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: ''
    }
  });

  const {
    control: securityControl,
    handleSubmit: handleSubmitSecurity,
    reset: resetSecurity,
    formState: { isSubmitting: isSubmittingSecurity }
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: ''
    }
  });

  const {
    control: notifyControl,
    handleSubmit: handleSubmitNotify,
    reset: resetNotify
  } = useForm({
    defaultValues: {
      notificationEmail: true,
      notificationSms: false
    }
  });

  useEffect(() => {
    get('/user/me')
      .then((data) => {
        const u = data.user;
        setUser(u);
        reset({
          fullName: u.fullName || '',
          email: u.email || '',
          phone: u.phone || '',
          address: u.address || '',
          dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : ''
        });
        resetNotify({
          notificationEmail:
            typeof u.notificationEmail === 'boolean' ? u.notificationEmail : true,
          notificationSms:
            typeof u.notificationSms === 'boolean' ? u.notificationSms : false
        });
      })
      .catch(() => {
        // ignore, routing guard should handle unauth cases
      });
  }, [reset, resetNotify, setUser]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        dateOfBirth: values.dateOfBirth || null
      };

      if (avatarFile) {
        const toDataUrl = (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

        payload.avatarDataUrl = await toDataUrl(avatarFile);
      }

      const data = await put('/user/me', payload);
      setUser(data.user);
      reset({
        fullName: data.user.fullName || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        address: data.user.address || '',
        dateOfBirth: data.user.dateOfBirth
          ? data.user.dateOfBirth.slice(0, 10)
          : ''
      });
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const onSubmitSecurity = async (values) => {
    try {
      await post('/user/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      resetSecurity({ currentPassword: '', newPassword: '' });
      toast.success('Đổi mật khẩu thành công');
    } catch (error) {
      toast.error(error.message || 'Không thể đổi mật khẩu');
    }
  };

  const onSubmitNotify = async (values) => {
    try {
      const data = await put('/user/me', {
        notificationEmail: values.notificationEmail,
        notificationSms: values.notificationSms
      });
      setUser(data.user);
      toast.success('Cập nhật cài đặt thông báo thành công');
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật cài đặt thông báo');
    }
  };

  const avatarUrl = avatarPreviewUrl || user?.avatarUrl;

  return (
    <div className="app-container pt-24 pb-12">
      <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="space-y-4 rounded-2xl bg-white p-4 shadow-card">
          <div className="flex flex-col items-center gap-3 pb-4 border-b border-slate-100">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-slate-100">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-500">
                  {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <label className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
              Thay đổi ảnh
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
              />
            </label>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-900">
                {user?.fullName || 'Người dùng'}
              </p>
              <p className="text-xs text-slate-500">Thành viên hạng Vàng</p>
            </div>
          </div>
          <nav className="space-y-1 text-sm">
            <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-900 hover:bg-slate-50">
              <span>Thông tin cá nhân</span>
            </button>
            <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-600 hover:bg-slate-50">
              <span>Cài đặt tài khoản</span>
            </button>
            <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-600 hover:bg-slate-50">
              <span>Phương thức thanh toán</span>
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <section className="space-y-6">
          {/* Thông tin cá nhân */}
          <div className="space-y-4 rounded-2xl bg-white shadow-card">
            <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-primary/10 to-sky-50 px-6 py-4 border-b border-slate-100">
              <h1 className="text-lg font-semibold text-slate-900">
                Thông tin cá nhân
              </h1>
            </div>

            <form
              className="space-y-4 px-6 pb-6 pt-4"
              onSubmit={handleSubmit(onSubmit)}
            >
            <div className="grid gap-4 md:grid-cols-2">
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

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Email"
                    type="email"
                    disabled
                    {...field}
                  />
                )}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Số điện thoại"
                    placeholder="Nhập số điện thoại"
                    {...field}
                  />
                )}
              />

              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Ngày sinh"
                    type="date"
                    {...field}
                  />
                )}
              />
            </div>

            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-800">
                    Địa chỉ
                  </label>
                  <textarea
                    className="min-h-[72px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Nhập địa chỉ"
                    {...field}
                  />
                </div>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                size="md"
                disabled={isSubmitting}
                className="rounded-xl"
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
          </div>

          {/* Cài đặt bảo mật */}
          <div className="space-y-4 rounded-2xl bg-white shadow-card">
            <div className="rounded-t-2xl bg-gradient-to-r from-primary/10 to-sky-50 px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">
                Cài đặt bảo mật
              </h2>
            </div>

            <form
              className="grid gap-4 px-6 pb-4 pt-4 md:grid-cols-2"
              onSubmit={handleSubmitSecurity(onSubmitSecurity)}
            >
              <Controller
                name="currentPassword"
                control={securityControl}
                rules={{ required: 'Vui lòng nhập mật khẩu hiện tại' }}
                render={({ field, fieldState }) => (
                  <TextInput
                    label="Mật khẩu hiện tại"
                    type="password"
                    error={fieldState.error}
                    {...field}
                  />
                )}
              />

              <Controller
                name="newPassword"
                control={securityControl}
                rules={{ required: 'Vui lòng nhập mật khẩu mới' }}
                render={({ field, fieldState }) => (
                  <TextInput
                    label="Mật khẩu mới"
                    type="password"
                    error={fieldState.error}
                    {...field}
                  />
                )}
              />

              <div className="md:col-span-2 flex justify-end pt-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingSecurity}
                  className="rounded-xl"
                >
                  Cập nhật mật khẩu
                </Button>
              </div>
            </form>

            <div className="space-y-3 px-6 pb-6 pt-2">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Thông báo
              </p>
              <form
                className="space-y-3"
                onSubmit={handleSubmitNotify(onSubmitNotify)}
              >
                <Controller
                  name="notificationEmail"
                  control={notifyControl}
                  render={({ field }) => (
                    <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                      <span>
                        Thông báo qua Email
                        <span className="mt-0.5 block text-xs text-slate-500">
                          Nhận thông tin khuyến mại và đặt chỗ qua email.
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </label>
                  )}
                />

                <Controller
                  name="notificationSms"
                  control={notifyControl}
                  render={({ field }) => (
                    <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                      <span>
                        Thông báo qua SMS
                        <span className="mt-0.5 block text-xs text-slate-500">
                          Nhận mã OTP và cập nhật khẩn cấp.
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </label>
                  )}
                />

                <div className="flex justify-end pt-1">
                  <Button type="submit" size="sm" className="rounded-xl">
                    Cập nhật
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Phương thức thanh toán (mock UI) */}
          <div className="space-y-4 rounded-2xl bg-white shadow-card">
            <div className="rounded-t-2xl bg-gradient-to-r from-primary/10 to-sky-50 px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">
                Phương thức thanh toán
              </h2>
            </div>

            <div className="space-y-3 px-6 pb-6 pt-4 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100" />
                  <div>
                    <p className="font-medium text-slate-900">Mastercard •••• 1234</p>
                    <p className="text-xs text-slate-500">Hết hạn 09/28</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-600">
                  Mặc định
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100" />
                  <div>
                    <p className="font-medium text-slate-900">Visa •••• 5678</p>
                    <p className="text-xs text-slate-500">Hết hạn 12/25</p>
                  </div>
                </div>
                <button className="text-xs font-medium text-primary hover:text-primaryDark">
                  Đặt làm mặc định
                </button>
              </div>

              <button className="mt-2 flex w-full items-center justify-center rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-500 hover:border-primary hover:text-primary">
                Thêm thẻ mới
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserInfoPage;
