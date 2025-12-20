/* eslint-disable react-hooks/preserve-manual-memoization */
import React, { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ChevronRight, Star, ShieldCheck } from 'lucide-react';
import Button from '../../components/atoms/Button/Button';
import Modal from '../../components/molecules/Modal/Modal';
import { useBookings } from '../../context/BookingContext';

const formatStayDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const formatDeadline = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short'
  }).format(date);
};

const formatGuestsSummary = (guests) => {
  if (!guests) {
    return '';
  }
  const parts = [];
  if (typeof guests.adults === 'number') {
    parts.push(`${guests.adults} Người lớn`);
  }
  if (guests.children) {
    parts.push(`${guests.children} Trẻ em`);
  }
  const rooms = guests.rooms || 1;
  parts.push(`${rooms} Phòng`);
  return parts.join(', ');
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const categorizeBooking = (booking) => {
  if (booking.status === 'cancelled') {
    return 'cancelled';
  }
  const checkoutDate = new Date(booking?.stay?.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!Number.isNaN(checkoutDate.getTime()) && checkoutDate < today) {
    return 'scheduled';
  }
  return 'current';
};

const statusBadge = {
  confirmed: { label: 'Đã xác nhận', classes: 'bg-green-50 text-green-700 border border-green-100' },
  pending: { label: 'Chờ thanh toán', classes: 'bg-amber-50 text-amber-700 border border-amber-100' },
  cancelled: { label: 'Đã hủy', classes: 'bg-red-50 text-red-700 border border-red-100' }
};

const MyBookingsPage = () => {
  const { bookings, loading, cancelBooking } = useBookings();
  const [activeTab, setActiveTab] = useState('current');
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const sortedBookings = useMemo(() => {
    const list = Array.isArray(bookings) ? bookings : [];
    return [...list].sort(
      (a, b) => new Date(b.createdAt || b.stay?.checkIn || 0) - new Date(a.createdAt || a.stay?.checkIn || 0)
    );
  }, [bookings]);

  const groupedBookings = useMemo(() => {
    return sortedBookings.reduce(
      (acc, booking) => {
        const group = categorizeBooking(booking);
        acc[group].push(booking);
        return acc;
      },
      { current: [], scheduled: [], cancelled: [] }
    );
  }, [sortedBookings]);

  const tabs = useMemo(
    () => [
      { id: 'current', label: 'Đặt phòng hiện tại', badge: groupedBookings.current.length },
      { id: 'scheduled', label: 'Lịch sử đặt phòng', badge: groupedBookings.scheduled.length },
      { id: 'cancelled', label: 'Đã hủy', badge: groupedBookings.cancelled.length }
    ],
    [groupedBookings]
  );

  const bookingsByTab = groupedBookings[activeTab] || [];

  const handleOpenCancelModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowCancelModal(true);
    setCancelReason('');
  };

  const handleCloseCancelModal = () => {
    if (!cancellingId) {
      setShowCancelModal(false);
      setSelectedBookingId(null);
      setCancelReason('');
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingId || cancellingId) {
      return;
    }
    try {
      setCancellingId(selectedBookingId);
      await cancelBooking(selectedBookingId, cancelReason);
      toast.success('Đã hủy đặt phòng thành công');
      setShowCancelModal(false);
      setSelectedBookingId(null);
      setCancelReason('');
    } catch (error) {
      console.error('Cancel booking failed', error);
      const message = error?.message || 'Không thể hủy đặt phòng, vui lòng thử lại';
      toast.error(message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-24">
      <div className="app-container">
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <ChevronRight size={16} />
          <Link to="/user/info" className="hover:text-primary">Tài khoản</Link>
          <ChevronRight size={16} />
          <span className="font-medium text-slate-900">Quản Lý Đặt Phòng</span>
        </nav>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quản Lý Đặt Phòng</h1>
            <p className="mt-2 text-slate-500">Xem và quản lý các chuyến đi sắp tới của bạn.</p>
          </div>
          <Link to="/search" className="inline-flex">
            <Button className="flex items-center gap-2 rounded-full px-6">
              <span>+</span>
              Đặt phòng mới
            </Button>
          </Link>
        </div>

        <div className="mb-8 border-b border-slate-200">
          <div className="flex gap-8 overflow-x-auto pb-2 text-sm">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-4 font-semibold transition-colors ${
                    isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                  {typeof tab.badge === 'number' && (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        isActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                  {isActive && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {loading && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
              Đang tải danh sách đặt phòng...
            </div>
          )}

          {!loading && bookingsByTab.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
              Chưa có đặt phòng trong mục này.
            </div>
          )}

          {bookingsByTab.map((booking) => {
            const badge = statusBadge[booking.status] || statusBadge.pending;
            const hotelInfo = booking.hotel || {};
            const stay = booking.stay || {};
            const timings = booking.timings || {};
            const paymentInfo = booking.payment || {};
            const image = hotelInfo.image;
            const rating = hotelInfo.rating;
            const paymentDeadline = paymentInfo.deadline ? formatDeadline(paymentInfo.deadline) : null;
            const totalPrice = booking.pricing?.total ?? paymentInfo.total ?? 0;
            const guestsLabel = formatGuestsSummary(booking.guests);

            return (
              <div
                key={booking.id}
                className="overflow-hidden rounded-3xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6"
              >
                <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 lg:h-auto lg:w-72">
                    {image ? (
                      <img src={image} alt={hotelInfo.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                        Không có hình ảnh
                      </div>
                    )}
                    {rating && (
                      <div className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-slate-900 backdrop-blur-sm">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        {Number(rating).toFixed(1)}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badge?.classes}`}>
                          <ShieldCheck size={14} />
                          {badge?.label}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{hotelInfo.name}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin size={14} />
                          <span>{hotelInfo.address}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Tổng giá tiền</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</p>
                      </div>
                    </div>

                    <hr className="my-4 border-slate-100" />

                    <div className="grid gap-6 sm:grid-cols-3">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Nhận phòng</p>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                          <Calendar size={16} className="text-primary" />
                          {formatStayDate(stay.checkIn)}
                        </div>
                        {timings.checkIn && (
                          <p className="mt-1 pl-6 text-xs text-slate-500">Từ {timings.checkIn}</p>
                        )}
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Trả phòng</p>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                          <Calendar size={16} className="text-primary" />
                          {formatStayDate(stay.checkOut)}
                        </div>
                        {timings.checkOut && (
                          <p className="mt-1 pl-6 text-xs text-slate-500">Trước {timings.checkOut}</p>
                        )}
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Khách & Phòng</p>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                          <Users size={16} className="text-primary" />
                          {guestsLabel}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                      {booking.status === 'confirmed' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenCancelModal(booking.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                          >
                            Hủy đặt phòng
                          </button>
                          <Button variant="outline" size="sm" className="rounded-full">
                            Sửa đổi
                          </Button>
                          <Link to={`/user/bookings/${booking.id}`}>
                            <Button variant="success" size="sm" className="rounded-full px-6">
                              Xem chi tiết
                            </Button>
                          </Link>
                        </>
                      )}
                      {booking.status === 'pending' && (
                        <>
                          {paymentDeadline && (
                            <div className="mr-auto flex items-center gap-2 text-sm font-semibold text-amber-600">
                              <Clock size={16} />
                              Hạn thanh toán: {paymentDeadline}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenCancelModal(booking.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                          >
                            Hủy đặt phòng
                          </button>
                          <Button size="sm" className="rounded-full bg-amber-600 px-6 hover:bg-amber-700 text-white focus:ring-amber-500">
                            Thanh toán ngay
                          </Button>
                          <Link to={`/user/bookings/${booking.id}`}>
                            <Button variant="outline" size="sm" className="rounded-full">
                              Chi tiết
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center text-sm text-slate-500">
          Bạn cần hỗ trợ về đặt phòng?
          <button className="ml-1 font-semibold text-primary hover:text-primaryDark">Liên hệ CSKH</button>
        </div>
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        title="Hủy đặt phòng"
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleCloseCancelModal}
              disabled={cancellingId === selectedBookingId}
            >
              Quay lại
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              disabled={cancellingId === selectedBookingId}
            >
              {cancellingId === selectedBookingId ? 'Đang hủy...' : 'Xác nhận hủy'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Bạn có chắc chắn muốn hủy đặt phòng này?
          </p>
          <div>
            <label htmlFor="cancelReason" className="block text-sm font-medium text-slate-700 mb-2">
              Lý do hủy (tùy chọn)
            </label>
            <textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy đặt phòng..."
              rows={3}
              maxLength={200}
              disabled={cancellingId === selectedBookingId}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-400">{cancelReason.length}/200 ký tự</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              ⚠️ Lưu ý: Sau khi hủy, đặt phòng này sẽ không thể khôi phục. Nếu đã thanh toán, tiền sẽ được hoàn lại trong 5-7 ngày làm việc.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyBookingsPage;
