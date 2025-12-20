import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Download, 
  MessageSquare, 
  Phone,
  Star,
  Copy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/atoms/Button/Button';
import Modal from '../../components/molecules/Modal/Modal';
import { useBookings } from '../../context/BookingContext';

const formatLongDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const formatGuests = (guests) => {
  if (!guests) {
    return '';
  }
  const segments = [];
  if (typeof guests.adults === 'number') {
    segments.push(`${guests.adults} Người lớn`);
  }
  if (guests.children) {
    segments.push(`${guests.children} Trẻ em`);
  }
  segments.push(`${guests.rooms || 1} Phòng`);
  return segments.join(', ');
};

const getPaymentMethodLabel = (method) => {
  switch (method) {
    case 'card':
      return 'Thẻ tín dụng/ghi nợ';
    case 'bank_transfer':
      return 'Chuyển khoản ngân hàng';
    case 'pay_at_hotel':
      return 'Thanh toán tại khách sạn';
    default:
      return 'Thanh toán';
  }
};

const getPaymentStatusBadge = (status) => {
  if (status === 'paid') {
    return { label: 'Đã thanh toán', classes: 'bg-green-100 text-green-700' };
  }
  if (status === 'refunded') {
    return { label: 'Đã hoàn tiền', classes: 'bg-sky-100 text-sky-700' };
  }
  return { label: 'Chưa thanh toán', classes: 'bg-amber-100 text-amber-700' };
};

const BookingDetailPage = () => {
  const { id } = useParams();
  const { getBooking, fetchBookingById, loading: bookingsLoading, cancelBooking } = useBookings();
  const [booking, setBooking] = useState(() => getBooking(id));
  const [fetching, setFetching] = useState(!getBooking(id));
  const [loadError, setLoadError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    const existing = getBooking(id);
    setBooking(existing || null);
    if (existing) {
      setFetching(false);
      setLoadError(null);
      return;
    }

    let isMounted = true;
    setFetching(true);
    setLoadError(null);
    fetchBookingById(id)
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setBooking(result || null);
        setFetching(false);
      })
      .catch((error) => {
        console.error('Cannot load booking detail', error);
        if (isMounted) {
          setLoadError(error);
          setFetching(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, getBooking, fetchBookingById]);

  if (fetching || bookingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <Link to="/user/bookings" className="mb-4 inline-flex items-center text-gray-500 hover:text-primary">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Quay lại danh sách đặt phòng
          </Link>
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            Đang tải thông tin đặt phòng...
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <Link to="/user/bookings" className="mb-4 inline-flex items-center text-gray-500 hover:text-primary">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Quay lại danh sách đặt phòng
          </Link>
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            {loadError ? 'Không thể tải thông tin đặt phòng.' : 'Không tìm thấy thông tin đặt phòng.'}
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = {
    confirmed: {
      label: 'Đã xác nhận',
      icon: CheckCircle2,
      classes: 'bg-green-50 text-green-700 border-green-200',
      description: 'Đơn đặt phòng của bạn đã được xác nhận. Vui lòng xuất trình mã đặt phòng khi nhận phòng.'
    },
    pending: {
      label: 'Chờ thanh toán',
      icon: Clock,
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Vui lòng hoàn tất thanh toán để giữ phòng.'
    },
    cancelled: {
      label: 'Đã hủy',
      icon: AlertCircle,
      classes: 'bg-red-50 text-red-700 border-red-200',
      description: 'Đơn đặt phòng này đã bị hủy.'
    }
  };

  const currentStatus = statusConfig[booking.status] || statusConfig.pending;
  const cancellation = booking.cancellation || {};
  const cancelledAtLabel = cancellation.cancelledAt ? formatDateTime(cancellation.cancelledAt) : '';
  const cancellationReason = (cancellation.reason || 'Đơn đặt phòng này đã bị hủy').trim();
  const reasonText = /[.!?]$/.test(cancellationReason) ? cancellationReason : `${cancellationReason}.`;
  const statusDescription = booking.status === 'cancelled'
    ? `${reasonText}${cancelledAtLabel ? ` Đã hủy lúc ${cancelledAtLabel}.` : ''}`
    : currentStatus.description;
  const StatusIcon = currentStatus.icon;
  const hotelInfo = booking.hotel || {};
  const stay = booking.stay || {};
  const timings = booking.timings || {};
  const guests = booking.guests || {};
  const contact = booking.contact || booking.guestInfo || {};
  const payment = booking.payment || {};
  const pricing = booking.pricing || { total: payment.total };
  const paymentBadge = getPaymentStatusBadge(payment.status);
  const paymentMethodLabel = getPaymentMethodLabel(payment.method);
  const paymentDeadline = payment.deadline ? formatDateTime(payment.deadline) : '';
  const bookingCreatedAt = booking.createdAt ? formatDateTime(booking.createdAt) : '';
  const checkInLabel = formatLongDate(stay.checkIn);
  const checkOutLabel = formatLongDate(stay.checkOut);
  const cardLast4 = payment.cardLast4 ? `**** ${payment.cardLast4}` : '';
  const breakdownItems = Array.isArray(payment.breakdown) && payment.breakdown.length > 0
    ? payment.breakdown
    : [
        { label: `Giá phòng (${stay.nights || 1} đêm)`, value: pricing.base || 0 },
        { label: 'Phí dịch vụ 10%', value: pricing.serviceFee || 0 },
        { label: 'Thuế 8%', value: pricing.tax || 0 }
      ];
  const totalAmount = pricing.total ?? payment.total ?? 0;

  const handleCopyCode = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard not supported');
      }
      await navigator.clipboard.writeText(booking.bookingCode);
      toast.success('Đã sao chép mã đặt phòng');
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Không thể sao chép mã đặt phòng');
    }
  };

  const handleDownloadTicket = async () => {
    if (!booking || isGeneratingTicket) {
      return;
    }
    try {
      setIsGeneratingTicket(true);
      const jsbarcodeModule = await import('jsbarcode');
      const JsBarcodeFn = jsbarcodeModule.default ?? jsbarcodeModule;
      const width = 800;
      const height = 420;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context unavailable');
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, 90);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('TravelNow Ticket', 40, 55);

      ctx.fillStyle = '#0f172a';
      ctx.font = '22px Arial';
      const bookingCodeText = `Mã đặt phòng: ${booking.bookingCode}`;
      ctx.fillText(bookingCodeText, 40, 130);
      ctx.font = '18px Arial';
      if (hotelInfo.name) {
        ctx.fillText(`Khách sạn: ${hotelInfo.name}`, 40, 170);
      }
      ctx.fillText(`Nhận phòng: ${checkInLabel || 'Đang cập nhật'}`, 40, 205);
      ctx.fillText(`Trả phòng: ${checkOutLabel || 'Đang cập nhật'}`, 40, 235);
      const guestSummary = formatGuests(guests) || 'Thông tin khách đang cập nhật';
      ctx.fillText(`Khách & phòng: ${guestSummary}`, 40, 265);
      ctx.fillText(`Tổng tiền: ${formatCurrency(totalAmount)}`, 40, 295);

      ctx.fillStyle = '#0f172a';
      ctx.font = '20px Arial';
      ctx.fillText(`Trạng thái: ${currentStatus.label}`, 40, 325);

      const barcodeCanvas = document.createElement('canvas');
      const barcodeValue = booking.bookingCode || 'TRAVELNOW';
      JsBarcodeFn(barcodeCanvas, barcodeValue, {
        format: 'CODE128',
        margin: 0,
        height: 120,
        width: 2,
        displayValue: false
      });

      const barcodeWidth = barcodeCanvas.width;
      const barcodeHeight = barcodeCanvas.height;
      const barcodeX = width - barcodeWidth - 60;
      const barcodeY = 140;
      ctx.drawImage(barcodeCanvas, barcodeX, barcodeY);

      ctx.fillStyle = '#475569';
      ctx.font = '16px Arial';
      const codeMetrics = ctx.measureText(barcodeValue);
      const codeX = barcodeX + (barcodeWidth - codeMetrics.width) / 2;
      ctx.fillText(barcodeValue, codeX, barcodeY + barcodeHeight + 30);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `travelnow-ticket-${booking.bookingCode || 'booking'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Đã tải vé xuống thiết bị');
    } catch (error) {
      console.error('Failed to export ticket', error);
      toast.error('Không thể xuất vé, vui lòng thử lại');
    } finally {
      setIsGeneratingTicket(false);
    }
  };

  const handleOpenCancelModal = () => {
    setShowCancelModal(true);
    setCancelReason('');
  };

  const handleCloseCancelModal = () => {
    if (!isCancelling) {
      setShowCancelModal(false);
      setCancelReason('');
    }
  };

  const handleConfirmCancel = async () => {
    if (!booking || isCancelling) {
      return;
    }
    try {
      setIsCancelling(true);
      const updated = await cancelBooking(booking.id, cancelReason);
      if (updated) {
        setBooking(updated);
      }
      toast.success('Đã hủy đặt phòng thành công');
      setShowCancelModal(false);
      setCancelReason('');
    } catch (error) {
      console.error('Failed to cancel booking', error);
      const message = error?.message || 'Không thể hủy đặt phòng, vui lòng thử lại';
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <Link to="/user/bookings" className="inline-flex items-center text-gray-500 hover:text-primary mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại danh sách
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết đặt phòng</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span>
                  Mã đặt phòng:
                  <span className="ml-1 font-medium text-gray-900">#{booking.bookingCode}</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:text-primary"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Sao chép
                </button>
              </div>
              {bookingCreatedAt && (
                <p className="mt-1 text-xs text-gray-400">Đặt lúc {bookingCreatedAt}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleDownloadTicket}
                disabled={isGeneratingTicket}
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingTicket ? 'Đang tạo vé...' : 'Tải vé'}</span>
              </Button>
              {booking.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  onClick={handleOpenCancelModal}
                  className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                >
                  Hủy phòng
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Card */}
            <div className={`bg-white rounded-xl p-6 border ${currentStatus.classes} border-l-4`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full bg-white/50`}>
                  <StatusIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{currentStatus.label}</h3>
                  <p className="mt-1 opacity-90">{statusDescription}</p>
                </div>
              </div>
            </div>

            {/* Hotel Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin khách sạn</h2>
                <div className="flex gap-4">
                  <div className="h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
                    {hotelInfo.image ? (
                      <img
                        src={hotelInfo.image}
                        alt={hotelInfo.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        Không có ảnh
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{hotelInfo.name || 'Khách sạn TravelNow'}</h3>
                    {hotelInfo.rating && (
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        <Star className="h-3.5 w-3.5" />
                        {Number(hotelInfo.rating).toFixed(1)}
                      </div>
                    )}
                    <div className="mt-2 flex items-start gap-2 text-sm text-gray-500">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{hotelInfo.address || 'Địa chỉ đang cập nhật'}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Button variant="outline" className="w-full justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Gọi khách sạn
                  </Button>
                  <Button variant="outline" className="w-full justify-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Chỉ đường
                  </Button>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Chi tiết lưu trú</h2>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-6 rounded-lg bg-gray-50 p-4">
                    <div>
                      <p className="text-sm text-gray-500">Nhận phòng</p>
                      <p className="font-bold text-gray-900">{checkInLabel || 'Đang cập nhật'}</p>
                      {timings.checkIn && (
                        <p className="text-sm text-gray-500">Từ {timings.checkIn}</p>
                      )}
                    </div>
                    <div className="hidden h-10 w-px bg-gray-200 md:block" />
                    <div>
                      <p className="text-sm text-gray-500">Trả phòng</p>
                      <p className="font-bold text-gray-900">{checkOutLabel || 'Đang cập nhật'}</p>
                      {timings.checkOut && (
                        <p className="text-sm text-gray-500">Trước {timings.checkOut}</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-100 p-4 text-sm text-gray-600">
                    <p className="text-sm font-semibold text-gray-700">Tổng quan đặt phòng</p>
                    <ul className="mt-3 space-y-2">
                      <li>• {stay.nights || 1} đêm • {guests.rooms || 1} phòng</li>
                      <li>• Khách lưu trú: {formatGuests(guests) || 'Đang cập nhật'}</li>
                      {booking.specialRequest && <li>• Ghi chú: {booking.specialRequest}</li>}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Thông tin liên hệ</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{contact.fullName || 'Chưa cập nhật'}</p>
                      {contact.phone && <p>{contact.phone}</p>}
                      {contact.email && <p>{contact.email}</p>}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Trạng thái thanh toán</p>
                    <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>{paymentMethodLabel}</span>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge.classes}`}>
                          {paymentBadge.label}
                        </span>
                      </div>
                      {cardLast4 && (
                        <p className="mt-2 text-xs text-gray-500">Thẻ {cardLast4}</p>
                      )}
                      {paymentDeadline && (
                        <p className="mt-2 text-xs text-amber-600">Hạn thanh toán: {paymentDeadline}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Chi tiết thanh toán</h2>
              <div className="space-y-3 mb-6">
                {breakdownItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="font-bold text-primary text-xl">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Phương thức</span>
                  <span className="text-sm font-medium text-gray-900">{paymentMethodLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trạng thái</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${paymentBadge.classes}`}>
                    {paymentBadge.label}
                  </span>
                </div>
                {cardLast4 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Thẻ {cardLast4}
                  </div>
                )}
                {paymentDeadline && (
                  <div className="mt-2 text-xs text-amber-600">
                    Hạn thanh toán: {paymentDeadline}
                  </div>
                )}
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Cần hỗ trợ?</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <MessageSquare className="w-4 h-4" />
                  Chat với hỗ trợ
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Phone className="w-4 h-4" />
                  Gọi tổng đài 1900 1234
                </Button>
              </div>
            </div>
          </div>
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
              disabled={isCancelling}
            >
              Quay lại
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
            >
              {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Bạn có chắc chắn muốn hủy đặt phòng <span className="font-semibold">#{booking.bookingCode}</span>?
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
              disabled={isCancelling}
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

export default BookingDetailPage;
