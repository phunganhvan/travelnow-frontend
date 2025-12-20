import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  Clock,
  Ticket
} from 'lucide-react';
import Button from '../../components/atoms/Button/Button';
import { get } from '../../services/api';
import { useBookings } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';

const formatDateInput = (date) => date.toISOString().split('T')[0];

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatVietnamDate = (dateLike) => {
  const date = new Date(dateLike);
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

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const ensureCardLast4 = (value) => {
  if (!value) {
    return '';
  }
  const digits = value.replace(/\D/g, '');
  return digits.slice(-4);
};

const steps = [
  {
    id: 'guest-info',
    title: 'Thông tin liên hệ',
    description: 'Cung cấp thông tin người nhận phòng'
  },
  {
    id: 'payment',
    title: 'Thanh toán',
    description: 'Chọn phương thức thanh toán phù hợp'
  },
  {
    id: 'review',
    title: 'Xác nhận đặt phòng',
    description: 'Kiểm tra lại thông tin trước khi hoàn tất'
  }
];

const paymentMethods = [
  {
    id: 'card',
    title: 'Thẻ tín dụng/ghi nợ',
    description: 'Thanh toán ngay bằng thẻ Visa, MasterCard, JCB',
    icon: CreditCard
  },
  {
    id: 'bank_transfer',
    title: 'Chuyển khoản ngân hàng',
    description: 'Thanh toán trong vòng 24h để giữ phòng',
    icon: Banknote
  },
  {
    id: 'pay_at_hotel',
    title: 'Thanh toán tại khách sạn',
    description: 'Thanh toán khi nhận phòng (áp dụng với một số khách sạn)',
    icon: ShieldCheck
  }
];

const HotelCheckoutPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addBooking } = useBookings();

  const initialState = location.state || {};
  const fallbackHotel = initialState.hotel || null;
  const fallbackNightlyPrice = initialState.pricing?.nightlyPrice || 0;
  
  const [roomType, setRoomType] = useState(initialState.roomType || null);

  const [hotel, setHotel] = useState(fallbackHotel);
  const [loadingHotel, setLoadingHotel] = useState(!fallbackHotel);
  const [checkInDate, setCheckInDate] = useState(initialState.checkIn || formatDateInput(new Date()));
  const [checkOutDate, setCheckOutDate] = useState(
    initialState.checkOut || formatDateInput(addDays(new Date(), 1))
  );
  const [adults, setAdults] = useState(initialState.adults || 2);
  const [children, setChildren] = useState(initialState.children || 0);
  const [rooms, setRooms] = useState(initialState.rooms || 1);
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(initialState.voucher || null);

  const [contact, setContact] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequest: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardInfo, setCardInfo] = useState({
    holderName: user?.fullName || '',
    number: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    async function fetchVouchers() {
      try {
        const data = await get('/vouchers');
        // Filter only claimed vouchers
        const claimed = data.filter(v => v.isClaimed);
        setVouchers(claimed);
      } catch (error) {
        console.error('Failed to fetch vouchers', error);
      }
    }
    if (user) {
      fetchVouchers();
    }
  }, [user]);

  useEffect(() => {
    async function fetchHotel() {
      if (hotel || !id) {
        setLoadingHotel(false);
        return;
      }
      try {
        setLoadingHotel(true);
        const data = await get(`/hotels/${id}`);
        setHotel(data);
      } catch (error) {
        console.error('Cannot fetch hotel for checkout', error);
        toast.error('Không tìm thấy khách sạn cần đặt.');
        setHotel(null);
      } finally {
        setLoadingHotel(false);
      }
    }

    fetchHotel();
  }, [hotel, id]);

  // Auto-select room type if missing (e.g. direct link from Home)
  useEffect(() => {
    async function fetchRoomTypes() {
      if (roomType || !hotel || !checkInDate || !checkOutDate) return;
      
      const hotelId = hotel._id || hotel.id || id;
      try {
        const params = new URLSearchParams({
          hotelId,
          checkIn: checkInDate,
          checkOut: checkOutDate
        });
        const data = await get(`/bookings/check-availability?${params}`);
        if (data.roomTypes && data.roomTypes.length > 0) {
           // Prefer available room
           const available = data.roomTypes.find(r => r.available) || data.roomTypes[0];
           setRoomType(available);
        }
      } catch (e) {
        console.error('Failed to auto-select room type', e);
      }
    }
    fetchRoomTypes();
  }, [hotel, id, checkInDate, checkOutDate, roomType]);

  useEffect(() => {
    async function checkRoomAvailability() {
      if (!hotel || !checkInDate || !checkOutDate || !roomType) {
        return;
      }
      const hotelId = hotel._id || hotel.id || id;
      if (!hotelId) {
        return;
      }
      try {
        setCheckingAvailability(true);
        const params = new URLSearchParams({
          hotelId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          roomTypeId: roomType.id
        });
        const data = await get(`/bookings/check-availability?${params}`);
        setAvailabilityInfo(data);
        if (!data.available) {
          toast.error(data.message || 'Loại phòng này không còn trống trong khoảng thời gian đã chọn');
        }
      } catch (error) {
        console.error('Failed to check availability', error);
        setAvailabilityInfo(null);
      } finally {
        setCheckingAvailability(false);
      }
    }

    checkRoomAvailability();
  }, [hotel, id, checkInDate, checkOutDate, roomType]);

  const nights = useMemo(() => {
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    const diff = outDate.getTime() - inDate.getTime();
    const total = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
    return Number.isFinite(total) ? total : 1;
  }, [checkInDate, checkOutDate]);

  const pricing = useMemo(() => {
    const nightly = Number(roomType?.pricePerNight || hotel?.pricePerNight || fallbackNightlyPrice || 0);
    const base = nightly * nights;
    const serviceFee = Math.round(base * 0.1);
    const tax = Math.round(base * 0.08);
    const preDiscountTotal = base + serviceFee + tax;

    let discount = 0;
    if (selectedVoucher) {
      discount = Math.round(preDiscountTotal * (selectedVoucher.discountPercentage / 100));
    }

    const total = Math.max(0, preDiscountTotal - discount);

    return {
      nightly,
      base,
      serviceFee,
      tax,
      discount,
      total
    };
  }, [hotel?.pricePerNight, initialState.pricing?.nightlyPrice, nights, selectedVoucher]);

  const summaryImage = useMemo(() => {
    if (!hotel) {
      if (!fallbackHotel) {
        return null;
      }
      if (fallbackHotel.image) {
        return fallbackHotel.image;
      }
      if (fallbackHotel.imageUrl) {
        return fallbackHotel.imageUrl;
      }
      if (Array.isArray(fallbackHotel.imageUrls) && fallbackHotel.imageUrls.length > 0) {
        return fallbackHotel.imageUrls[0];
      }
      if (Array.isArray(fallbackHotel.photos) && fallbackHotel.photos.length > 0) {
        return fallbackHotel.photos[0];
      }
      return null;
    }
    if (hotel.imageUrl) {
      return hotel.imageUrl;
    }
    if (Array.isArray(hotel.imageUrls) && hotel.imageUrls.length > 0) {
      return hotel.imageUrls[0];
    }
    if (Array.isArray(hotel.photos) && hotel.photos.length > 0) {
      return hotel.photos[0];
    }
    return null;
  }, [hotel, initialState.hotel]);

  const occupancyLabel = useMemo(() => {
    const guests = adults + children;
    return `${guests} khách • ${rooms} phòng`;
  }, [adults, children, rooms]);

  const disabledNext = stepIndex === 0 && (!contact.fullName || !contact.email || !contact.phone);

  const validateStep = () => {
    if (stepIndex === 0) {
      if (!contact.fullName || !contact.email || !contact.phone) {
        toast.error('Vui lòng điền đầy đủ thông tin liên hệ.');
        return false;
      }
      return true;
    }

    if (stepIndex === 1) {
      if (paymentMethod === 'card') {
        if (!cardInfo.holderName || !cardInfo.number || !cardInfo.expiry || !cardInfo.cvv) {
          toast.error('Vui lòng nhập đầy đủ thông tin thẻ.');
          return false;
        }
      }
      return true;
    }

    return true;
  };

  const goNext = () => {
    if (!validateStep()) {
      return;
    }
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goPrev = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleConfirmBooking = async () => {
    if (!hotel) {
      toast.error('Không thể hoàn tất đặt phòng do thiếu thông tin khách sạn.');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingStatus = paymentMethod === 'card' ? 'confirmed' : 'pending';
      const paymentStatus = paymentMethod === 'card' ? 'paid' : 'unpaid';
      const deadline = paymentMethod === 'bank_transfer' ? addDays(new Date(), 1).toISOString() : null;

      const payload = {
        status: bookingStatus,
        voucherId: selectedVoucher?._id,
        hotel: {
          id: hotel._id || hotel.id || id,
          name: hotel.name,
          image: summaryImage,
          rating: hotel.rating || fallbackHotel?.rating || null,
          address: hotel.address || hotel.city || fallbackHotel?.address || ''
        },
        roomType: roomType ? {
          id: roomType.id,
          name: roomType.name,
          pricePerNight: roomType.pricePerNight,
          bedType: roomType.bedType,
          maxGuests: roomType.maxGuests
        } : null,
        stay: {
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights
        },
        timings: {
          checkIn: hotel.checkInTime || '14:00',
          checkOut: hotel.checkOutTime || '12:00'
        },
        guests: {
          adults,
          children,
          rooms
        },
        pricing: {
          nightly: pricing.nightly,
          base: pricing.base,
          serviceFee: pricing.serviceFee,
          tax: pricing.tax,
          total: pricing.total
        },
        payment: {
          method: paymentMethod,
          status: paymentStatus,
          cardLast4: paymentMethod === 'card' ? ensureCardLast4(cardInfo.number) : '',
          deadline,
          total: pricing.total,
          breakdown: [
            { label: `Giá phòng (${nights} đêm)`, value: pricing.base },
            { label: 'Phí dịch vụ 10%', value: pricing.serviceFee },
            { label: 'Thuế 8%', value: pricing.tax }
          ]
        },
        contact: {
          fullName: contact.fullName,
          email: contact.email,
          phone: contact.phone
        },
        specialRequest: contact.specialRequest || ''
      };

      const created = await addBooking(payload);
      toast.success('Đặt phòng thành công!');
      if (created?.id) {
        navigate(`/user/bookings/${created.id}`, {
          replace: true,
          state: { justBooked: true }
        });
      } else {
        navigate('/user/bookings');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepIndex]);

  if (loadingHotel) {
    return (
      <div className="app-container pt-24 pb-12">
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-card">
          Đang tải thông tin đặt phòng...
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="app-container pt-24 pb-12">
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-card">
          Không tìm thấy khách sạn tương ứng.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16 pt-24">
      <div className="app-container">
        <div className="mb-6 flex items-center justify-between">
          <Link to={`/hotel/${id}`} className="inline-flex items-center text-sm text-slate-500 hover:text-primary">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Quay lại chi tiết khách sạn
          </Link>
          <span className="text-xs text-slate-400">Mã bảo mật SSL 256-bit</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <section className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-card">
              <div className="grid gap-4 sm:grid-cols-3">
                {steps.map((step, index) => {
                  const isActive = index === stepIndex;
                  const isCompleted = index < stepIndex;
                  return (
                    <div
                      key={step.id}
                      className={`rounded-2xl border p-4 transition ${
                        isActive
                          ? 'border-primary bg-primary/5'
                          : isCompleted
                          ? 'border-emerald-100 bg-emerald-50'
                          : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Bước {index + 1}
                        </p>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <span className={`h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center ${
                            isActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-slate-900">{step.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{step.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {stepIndex === 0 && (
              <div className="rounded-3xl bg-white p-6 shadow-card">
                <h2 className="text-lg font-semibold text-slate-900">Thông tin liên hệ</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Các thông tin này sẽ được dùng để liên hệ và xác thực khi nhận phòng.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Họ và tên</label>
                    <input
                      type="text"
                      value={contact.fullName}
                      onChange={(event) => setContact((prev) => ({ ...prev, fullName: event.target.value }))}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="email@example.com"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(event) => setContact((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="Nhập số điện thoại liên hệ"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Ghi chú (nếu có)</label>
                    <input
                      type="text"
                      value={contact.specialRequest}
                      onChange={(event) => setContact((prev) => ({ ...prev, specialRequest: event.target.value }))}
                      placeholder="Yêu cầu đặc biệt, giờ nhận phòng..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Người lớn</label>
                    <input
                      type="number"
                      min={1}
                      value={adults}
                      onChange={(event) => setAdults(Math.max(1, Number(event.target.value) || 1))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Trẻ em</label>
                    <input
                      type="number"
                      min={0}
                      value={children}
                      onChange={(event) => setChildren(Math.max(0, Number(event.target.value) || 0))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Số phòng</label>
                    <input
                      type="number"
                      min={1}
                      value={rooms}
                      onChange={(event) => setRooms(Math.max(1, Number(event.target.value) || 1))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
              </div>
            )}

            {stepIndex === 1 && (
              <div className="rounded-3xl bg-white p-6 shadow-card">
                <h2 className="text-lg font-semibold text-slate-900">Phương thức thanh toán</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Lựa chọn phương thức bạn muốn sử dụng để hoàn tất đơn đặt.
                </p>

                <div className="mt-6 space-y-4">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isActive = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          isActive
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-slate-200 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{method.title}</p>
                            <p className="text-xs text-slate-500">{method.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Tên in trên thẻ</label>
                      <input
                        type="text"
                        value={cardInfo.holderName}
                        onChange={(event) =>
                          setCardInfo((prev) => ({ ...prev, holderName: event.target.value }))
                        }
                        placeholder="Ví dụ: NGUYEN VAN A"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 uppercase shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Số thẻ</label>
                      <input
                        type="text"
                        value={cardInfo.number}
                        onChange={(event) =>
                          setCardInfo((prev) => ({ ...prev, number: event.target.value }))
                        }
                        placeholder="1234 5678 9012 3456"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Ngày hết hạn</label>
                      <input
                        type="text"
                        value={cardInfo.expiry}
                        onChange={(event) =>
                          setCardInfo((prev) => ({ ...prev, expiry: event.target.value }))
                        }
                        placeholder="MM/YY"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">CVV/CVC</label>
                      <input
                        type="password"
                        value={cardInfo.cvv}
                        onChange={(event) =>
                          setCardInfo((prev) => ({ ...prev, cvv: event.target.value }))
                        }
                        placeholder="***"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    <p className="font-semibold">Hướng dẫn chuyển khoản</p>
                    <p className="mt-2 text-xs text-amber-600">
                      Vui lòng chuyển khoản theo thông tin được gửi đến email sau khi đặt. Đơn sẽ được giữ tối đa 24h.
                    </p>
                  </div>
                )}

                {paymentMethod === 'pay_at_hotel' && (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold">Thanh toán tại khách sạn</p>
                    <p className="mt-2 text-xs">
                      Bạn sẽ thanh toán tổng chi phí trực tiếp tại khách sạn khi làm thủ tục nhận phòng.
                    </p>
                  </div>
                )}
              </div>
            )}

            {stepIndex === 2 && (
              <div className="rounded-3xl bg-white p-6 shadow-card">
                <h2 className="text-lg font-semibold text-slate-900">Kiểm tra và xác nhận</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Đảm bảo thông tin chính xác trước khi hoàn tất đơn đặt phòng.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Thông tin người liên hệ</h3>
                    <div className="mt-2 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                      <p><span className="font-medium text-slate-700">Họ và tên:</span> {contact.fullName}</p>
                      <p><span className="font-medium text-slate-700">Email:</span> {contact.email}</p>
                      <p><span className="font-medium text-slate-700">Số điện thoại:</span> {contact.phone}</p>
                      {contact.specialRequest && (
                        <p className="md:col-span-2">
                          <span className="font-medium text-slate-700">Ghi chú:</span> {contact.specialRequest}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Phương thức thanh toán</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {paymentMethods.find((item) => item.id === paymentMethod)?.title}
                    </p>
                    {paymentMethod === 'card' && (
                      <p className="text-xs text-slate-500">
                        Thẻ **** {ensureCardLast4(cardInfo.number)}
                      </p>
                    )}
                    {paymentMethod === 'bank_transfer' && (
                      <p className="text-xs text-amber-600">
                        Vui lòng thanh toán trong vòng 24h kể từ khi đặt.
                      </p>
                    )}
                    {paymentMethod === 'pay_at_hotel' && (
                      <p className="text-xs text-slate-500">
                        Thanh toán khi làm thủ tục nhận phòng.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <p className="font-semibold">Cam kết từ TravelNow</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Hỗ trợ khách hàng 24/7.</li>
                    <li>• Miễn phí hủy trong vòng 24h đối với đơn chưa thanh toán.</li>
                    <li>• Bảo mật thông tin thanh toán.</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Bước {stepIndex + 1} / {steps.length}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {stepIndex > 0 && (
                  <Button variant="outline" onClick={goPrev} className="sm:w-auto">
                    Quay lại
                  </Button>
                )}
                {stepIndex < steps.length - 1 && (
                  <Button 
                    onClick={goNext} 
                    disabled={disabledNext || !availabilityInfo?.available || checkingAvailability} 
                    className="sm:w-auto"
                  >
                    {checkingAvailability ? 'Kiểm tra phòng...' : 'Tiếp tục'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {stepIndex === steps.length - 1 && (
                  <Button 
                    onClick={handleConfirmBooking} 
                    disabled={isSubmitting || !availabilityInfo?.available} 
                    className="sm:w-auto"
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
                  </Button>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl bg-white shadow-card">
              {summaryImage && (
                <img src={summaryImage} alt={hotel.name} className="h-40 w-full object-cover" />
              )}
              <div className="space-y-4 p-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{hotel.name}</h2>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{hotel.address || hotel.city}</span>
                  </div>
                  {roomType && (
                    <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                      <p className="text-xs font-medium text-emerald-800">{roomType.name}</p>
                      <p className="text-[11px] text-emerald-600">{roomType.bedType} • Tối đa {roomType.maxGuests} khách</p>
                    </div>
                  )}
                  <div className="mt-3 grid gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>
                        {formatVietnamDate(checkInDate)} → {formatVietnamDate(checkOutDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{occupancyLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>
                        Nhận phòng từ {hotel.checkInTime || '14:00'} • Trả phòng trước {hotel.checkOutTime || '12:00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voucher Selection */}
                <div className="mb-4 border-t border-slate-100 pt-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Mã giảm giá</label>
                  <div className="relative">
                    <select
                      value={selectedVoucher?._id || ''}
                      onChange={(e) => {
                        const voucher = vouchers.find(v => v._id === e.target.value);
                        setSelectedVoucher(voucher || null);
                      }}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-slate-50 disabled:text-slate-500"
                      disabled={vouchers.length === 0}
                    >
                      <option value="">Chọn mã giảm giá</option>
                      {vouchers.map((voucher) => (
                        <option key={voucher._id} value={voucher._id}>
                          {voucher.code} - Giảm {voucher.discountPercentage}%
                        </option>
                      ))}
                    </select>
                    <Ticket className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  {vouchers.length === 0 ? (
                    <p className="mt-1 text-xs text-slate-500">Bạn chưa có mã giảm giá nào.</p>
                  ) : (
                    <p className="mt-1 text-xs text-emerald-600">Bạn có {vouchers.length} mã giảm giá khả dụng.</p>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Giá phòng ({nights} đêm)</span>
                    <span>{formatCurrency(pricing.base)}</span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span>Phí dịch vụ 10%</span>
                    <span>{formatCurrency(pricing.serviceFee)}</span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span>Thuế 8%</span>
                    <span>{formatCurrency(pricing.tax)}</span>
                  </div>
                  {pricing.discount > 0 && (
                    <div className="mt-1 flex justify-between text-emerald-600 font-medium">
                      <span>Giảm giá voucher</span>
                      <span>-{formatCurrency(pricing.discount)}</span>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(pricing.total)}</span>
                  </div>
                </div>

                {checkingAvailability && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
                    Đang kiểm tra tình trạng phòng...
                  </div>
                )}

                {availabilityInfo && !availabilityInfo.available && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                    <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Không còn phòng</p>
                    <p className="text-xs text-red-700">
                      {availabilityInfo.message}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Còn trống: {availabilityInfo.availableRooms}/{availabilityInfo.totalRooms} phòng
                    </p>
                  </div>
                )}

                {availabilityInfo && availabilityInfo.available && availabilityInfo.availableRooms <= 3 && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-sm font-semibold text-amber-800">⚠️ Sắp hết phòng!</p>
                    <p className="text-xs text-amber-700">
                      Chỉ còn {availabilityInfo.availableRooms} phòng trống trong khoảng thời gian này.
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 p-4 text-xs text-slate-500">
                  <p>
                    Bao gồm thuế và phí. Giá có thể thay đổi tùy vào chính sách của khách sạn theo mùa du lịch.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HotelCheckoutPage;
