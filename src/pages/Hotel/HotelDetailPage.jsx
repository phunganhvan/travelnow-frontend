import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Ticket, MapPin } from 'lucide-react';
import { get, post } from '../../services/api';
import Button from '../../components/atoms/Button/Button';
import RoomTypeCard from '../../components/molecules/RoomTypeCard/RoomTypeCard';
import { useAuth } from '../../context/AuthContext';

const formatDateInput = (date) => date.toISOString().split('T')[0];

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const HotelDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hotel, setHotel] = useState(() => location.state?.hotel || null);
  const [loading, setLoading] = useState(false);
  const [checkIn, setCheckIn] = useState(() => formatDateInput(new Date()));
  const [checkOut, setCheckOut] = useState(() => formatDateInput(addDays(new Date(), 1)));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);
  
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Đánh giá & Nhận xét
  const [reviewsSummary, setReviewsSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    criteria: {
      cleanliness: 0,
      amenities: 0,
      location: 0,
      service: 0,
      valueForMoney: 0
    }
  });
  const [reviews, setReviews] = useState([]);
  const [myRatings, setMyRatings] = useState({
    cleanliness: 0,
    amenities: 0,
    location: 0,
    service: 0,
    valueForMoney: 0
  });
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    async function fetchVouchers() {
      try {
        const data = await get('/vouchers');
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

  const photoList = useMemo(() => {
    if (!hotel) return [];
    const list = [];
    if (Array.isArray(hotel.imageUrls) && hotel.imageUrls.length > 0) {
      list.push(...hotel.imageUrls.filter(Boolean));
    }
    if (hotel.photos && hotel.photos.length > 0) {
      list.push(...hotel.photos.filter(Boolean));
    }
    if (hotel.imageUrl) {
      list.unshift(hotel.imageUrl);
    }
    return [...new Set(list)];
  }, [hotel]);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [photoList]);

  const activePhoto = photoList[currentPhotoIndex] || null;

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photoList.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === photoList.length - 1 ? 0 : prev + 1));
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (photoList.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev === photoList.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [photoList.length]);

  const nights = useMemo(() => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return 1;
    }
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  const pricing = useMemo(() => {
    const nightlyPrice = selectedRoomType?.pricePerNight || Number(hotel?.pricePerNight) || 0;
    const base = nightlyPrice * nights;
    const serviceFee = Math.round(base * 0.1);
    const tax = Math.round(base * 0.08);
    const preDiscountTotal = base + serviceFee + tax;

    let discount = 0;
    if (selectedVoucher) {
      discount = Math.round(preDiscountTotal * (selectedVoucher.discountPercentage / 100));
    }

    const total = Math.max(0, preDiscountTotal - discount);

    return {
      nightlyPrice,
      base,
      serviceFee,
      tax,
      discount,
      total
    };
  }, [selectedRoomType, hotel?.pricePerNight, nights, selectedVoucher]);

  useEffect(() => {
    async function fetchHotel() {
      if (!id) return;
      
      try {
        // Vẫn fetch lại để lấy dữ liệu mới nhất (ví dụ virtualTourUrl)
        // setLoading(true); // Có thể không cần set loading nếu đã có data cũ để tránh nháy
        const data = await get(`/hotels/${id}`);
        setHotel(data);
      } catch (error) {
        console.error('Failed to fetch hotel detail', error);
        // Chỉ set null nếu chưa có dữ liệu
        if (!hotel) setHotel(null);
        // toast.error('Không thể tải thông tin khách sạn');
      } finally {
        setLoading(false);
      }
    }

    fetchHotel();
  }, [id]);

  // Ghi nhận hành vi xem chi tiết khách sạn sau khi dữ liệu được tải
  useEffect(() => {
    if (!id || !hotel) return;
    try {
      post('/analytics/track', {
        actionType: 'view_hotel',
        metadata: { hotelId: id }
      });
    } catch (e) {
      // Bỏ qua lỗi tracking để không ảnh hưởng trải nghiệm người dùng
    }
  }, [id, hotel]);

  // Lấy danh sách đánh giá của khách sạn
  useEffect(() => {
    async function fetchReviews() {
      if (!id) return;
      try {
        const data = await get(`/hotels/${id}/reviews`);
        const rawSummary = data.summary || {};
        const normalizedSummary = {
          averageRating: rawSummary.averageRating || 0,
          totalReviews: rawSummary.totalReviews || 0,
          criteria: {
            cleanliness: rawSummary.criteria?.cleanliness || 0,
            amenities: rawSummary.criteria?.amenities || 0,
            location: rawSummary.criteria?.location || 0,
            service: rawSummary.criteria?.service || 0,
            valueForMoney: rawSummary.criteria?.valueForMoney || 0
          }
        };

        const list = Array.isArray(data.reviews) ? data.reviews : [];

        setReviewsSummary(normalizedSummary);
        setReviews(list);

        const userId = user?.id || user?._id;
        if (userId) {
          const myReview = list.find((r) => r.user && (r.user._id === userId || r.user.id === userId));
          if (myReview) {
            setMyRatings({
              cleanliness: myReview.cleanliness || 0,
              amenities: myReview.amenities || 0,
              location: myReview.location || 0,
              service: myReview.service || 0,
              valueForMoney: myReview.valueForMoney || 0
            });
            setMyComment(myReview.comment || '');
          }
        }
      } catch (error) {
        console.error('Failed to fetch hotel reviews', error);
      }
    }

    fetchReviews();
  }, [id, user]);

  useEffect(() => {
    async function fetchRoomAvailability() {
      if (!hotel || !checkIn || !checkOut) {
        return;
      }
      const hotelId = hotel._id || hotel.id || id;
      if (!hotelId) {
        return;
      }
      try {
        setLoadingRoomTypes(true);
        const params = new URLSearchParams({
          hotelId,
          checkIn,
          checkOut
        });
        const data = await get(`/bookings/check-availability?${params}`);
        if (data.roomTypes && Array.isArray(data.roomTypes)) {
          setRoomTypes(data.roomTypes);
          const availableRoom = data.roomTypes.find((rt) => rt.available);
          if (availableRoom && !selectedRoomType) {
            setSelectedRoomType(availableRoom);
          }
        }
      } catch (error) {
        console.error('Failed to fetch room types', error);
        setRoomTypes([]);
      } finally {
        setLoadingRoomTypes(false);
      }
    }

    fetchRoomAvailability();
  }, [hotel, id, checkIn, checkOut]);

  const handleCheckInChange = (event) => {
    const value = event.target.value;
    setCheckIn(value);

    if (new Date(value) >= new Date(checkOut)) {
      const nextDay = formatDateInput(addDays(new Date(value), 1));
      setCheckOut(nextDay);
    }
  };

  const handleCheckOutChange = (event) => {
    const value = event.target.value;
    if (new Date(value) <= new Date(checkIn)) {
      toast.error('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }
    setCheckOut(value);
  };

  const handleAdultsChange = (event) => {
    const value = Math.max(1, Number(event.target.value) || 1);
    setAdults(value);
  };

  const handleChildrenChange = (event) => {
    const value = Math.max(0, Number(event.target.value) || 0);
    setChildren(value);
  };

  const [viewMode, setViewMode] = useState('photos'); // 'photos', 'tour'

  const myAverageRating = useMemo(() => {
    const values = Object.values(myRatings).filter((v) => v > 0);
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, v) => acc + v, 0);
    return sum / values.length;
  }, [myRatings]);

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!hotel) return;

    if (!user) {
      const hotelId = hotel._id || hotel.id || id;
      toast.error('Bạn cần đăng nhập để gửi đánh giá');
      navigate('/user/login', {
        state: {
          redirectTo: `/hotel/${hotelId}`
        }
      });
      return;
    }

    const scores = myRatings;
    const invalid = Object.values(scores).some((v) => !v || v < 1 || v > 5);
    if (invalid) {
      toast.error('Vui lòng đánh giá đầy đủ 5 hạng mục với số sao từ 1 đến 5');
      return;
    }

    try {
      setSubmittingReview(true);
      const hotelId = hotel._id || hotel.id || id;

      await post(`/hotels/${hotelId}/reviews`, {
        cleanliness: scores.cleanliness,
        amenities: scores.amenities,
        location: scores.location,
        service: scores.service,
        valueForMoney: scores.valueForMoney,
        comment: myComment
      });

      toast.success('Gửi đánh giá thành công');

      // Refresh lại danh sách đánh giá
      const data = await get(`/hotels/${hotelId}/reviews`);
      const rawSummary = data.summary || {};
      const normalizedSummary = {
        averageRating: rawSummary.averageRating || 0,
        totalReviews: rawSummary.totalReviews || 0,
        criteria: {
          cleanliness: rawSummary.criteria?.cleanliness || 0,
          amenities: rawSummary.criteria?.amenities || 0,
          location: rawSummary.criteria?.location || 0,
          service: rawSummary.criteria?.service || 0,
          valueForMoney: rawSummary.criteria?.valueForMoney || 0
        }
      };

      const list = Array.isArray(data.reviews) ? data.reviews : [];

      setReviewsSummary(normalizedSummary);
      setReviews(list);

      // Reset form đánh giá sau khi gửi thành công
      setMyRatings({
        cleanliness: 0,
        amenities: 0,
        location: 0,
        service: 0,
        valueForMoney: 0
      });
      setMyComment('');
    } catch (error) {
      console.error('Failed to submit review', error);
      const message = error?.message || 'Không thể gửi đánh giá, vui lòng thử lại';
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBookNow = () => {
    if (!hotel) {
      return;
    }
    if (!selectedRoomType) {
      toast.error('Vui lòng chọn loại phòng');
      return;
    }
    const hotelId = hotel._id || hotel.id || id;
    if (!user) {
      navigate('/user/login', {
        state: {
          redirectTo: `/hotel/${hotelId}/checkout`,
          bookingPayload: {
            hotel,
            roomType: selectedRoomType,
            checkIn,
            checkOut,
            nights,
            adults,
            children,
            rooms: 1,
            pricing
          }
        }
      });
      return;
    }
    navigate(`/hotel/${hotelId}/checkout`, {
      state: {
        hotel,
        roomType: selectedRoomType,
        checkIn,
        checkOut,
        nights,
        adults,
        children,
        rooms: 1,
        pricing,
        voucher: selectedVoucher
      }
    });
  };

  if (!hotel && loading) {
    return (
      <div className="app-container pt-24 pb-10 text-center text-sm text-slate-500">
        Đang tải thông tin khách sạn...
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="app-container pt-24 pb-10 text-center text-sm text-slate-500">
        Không tìm thấy thông tin khách sạn.
      </div>
    );
  }

  const averageRating = reviewsSummary.averageRating || hotel.rating || 0;
  const totalReviews = reviewsSummary.totalReviews || hotel.reviewCount || 0;

  const mapsUrl = useMemo(() => {
    if (!hotel) return '';
    const queryParts = [hotel.name, hotel.address || hotel.city].filter(Boolean);
    if (queryParts.length === 0) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryParts.join(' '))}`;
  }, [hotel]);

  return (
    <div className="app-container pt-24 pb-10 space-y-6">
      {/* Hàng đầu tiên: Thông tin (Trái) + Slide ảnh (Phải) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Thông tin khách sạn */}
        <section className="rounded-3xl bg-white p-6 shadow-card h-fit">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {hotel.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span>
                  {hotel.city}
                  {hotel.address ? ` • ${hotel.address}` : ''}
                </span>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                  >
                    <MapPin size={14} />
                    Chỉ đường
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {hotel.stars && (
                <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  {[...Array(hotel.stars)].map((_, idx) => (
                    <span key={idx} className="text-yellow-400">★</span>
                  ))}
                  <span className="text-amber-800">{`(${hotel.stars} sao)`}</span>
                </div>
              )}
              {hotel.rating && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-800">
                    <span className="text-yellow-400">★</span>
                    {hotel.rating.toFixed(1)}
                  </span>
                  <span className="text-slate-500">
                    {hotel.reviewCount
                      ? `${hotel.reviewCount.toLocaleString('vi-VN')} đánh giá`
                      : 'Đánh giá của khách'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {hotel.description}
          </p>
        </section>

        {/* 2. Slide ảnh & 3D Tour */}
        <div className="space-y-3">
          <div className="rounded-3xl bg-white p-3 shadow-card">
            <div className="relative h-64 overflow-hidden rounded-2xl bg-slate-100 md:h-[380px]">
              {viewMode === 'tour' && hotel.virtualTourUrl ? (
                <iframe
                  src={hotel.virtualTourUrl}
                  title="Virtual Tour"
                  className="h-full w-full border-0"
                  allowFullScreen
                  loading="lazy"
                  allow="xr-spatial-tracking; gyroscope; accelerometer"
                />
              ) : activePhoto ? (
                <>
                  <img
                    src={activePhoto}
                    alt={hotel.name}
                    className="h-full w-full object-cover transition-opacity duration-300"
                  />
                  {photoList.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevPhoto}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-all hover:bg-black/60"
                        aria-label="Ảnh trước"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextPhoto}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-all hover:bg-black/60"
                        aria-label="Ảnh tiếp theo"
                      >
                        <ChevronRight size={22} />
                      </button>
                      <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">
                        {currentPhotoIndex + 1} / {photoList.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Chưa có hình ảnh
                </div>
              )}

              {/* Các nút chuyển đổi chế độ xem */}
              <div className="absolute bottom-3 left-3 z-10 flex gap-2">
                {/* Nút Xem Ảnh (chỉ hiện khi đang ở chế độ khác) */}
                {viewMode !== 'photos' && (
                  <button
                    onClick={() => setViewMode('photos')}
                    className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-slate-900 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white"
                  >
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/833/833281.png" 
                      alt="Photos" 
                      className="h-4 w-4"
                    />
                    Xem Ảnh
                  </button>
                )}

                {/* Nút 3D Tour */}
                {hotel.virtualTourUrl && viewMode !== 'tour' && (
                  <button
                    onClick={() => setViewMode('tour')}
                    className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-slate-900 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white"
                  >
                    <img 
                      src="/logo.png" 
                      alt="3D Tour" 
                      className="h-4 w-4 object-contain"
                    />
                    Xem 3D Tour
                  </button>
                )}
              </div>
            </div>
          </div>

          {photoList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photoList.map((photo, index) => {
                const isActive = index === currentPhotoIndex;
                return (
                  <button
                    type="button"
                    key={photo}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      isActive ? 'border-primary' : 'border-transparent hover:border-primary/60'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Ảnh khách sạn ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {isActive && (
                      <span className="absolute inset-0 border-2 border-primary" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Grid: Các loại phòng (Trái) + Đặt phòng (Phải) */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        {/* Phần các loại phòng */}
        <section className="rounded-3xl bg-white p-4 shadow-card h-fit">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Các loại phòng
          </h2>
          {loadingRoomTypes && (
            <div className="py-8 text-center text-sm text-slate-500">
              Đang tải danh sách phòng...
            </div>
          )}
          {!loadingRoomTypes && roomTypes.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-500">
              Khách sạn chưa có loại phòng nào hoặc không còn phòng trống trong khoảng thời gian này.
            </div>
          )}
          {!loadingRoomTypes && roomTypes.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {roomTypes.map((roomType) => (
                <RoomTypeCard
                  key={roomType.id}
                  roomType={roomType}
                  nights={nights}
                  selected={selectedRoomType?.id === roomType.id}
                  onSelect={setSelectedRoomType}
                />
              ))}
            </div>
          )}
        </section>

        {/* Cột giá + đặt phòng bên phải */}
        <aside className="space-y-4">
          <section className="rounded-3xl bg-white p-6 shadow-card">
            <p className="text-xs font-medium uppercase text-slate-400">Giá mỗi đêm</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {pricing.nightlyPrice.toLocaleString('vi-VN')} đ
              <span className="text-sm font-normal text-slate-500"> / đêm</span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div>
                <p className="mb-1 font-medium text-slate-800">Nhận phòng</p>
                <div className="rounded-xl border border-slate-200 px-3 py-2">
                  <input
                    type="date"
                    value={checkIn}
                    onChange={handleCheckInChange}
                    className="w-full border-none bg-transparent p-0 text-sm text-slate-900 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>
              <div>
                <p className="mb-1 font-medium text-slate-800">Trả phòng</p>
                <div className="rounded-xl border border-slate-200 px-3 py-2">
                  <input
                    type="date"
                    value={checkOut}
                    min={formatDateInput(addDays(new Date(checkIn), 1))}
                    onChange={handleCheckOutChange}
                    className="w-full border-none bg-transparent p-0 text-sm text-slate-900 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <p className="mb-1 font-medium text-slate-800">Khách</p>
                <div className="rounded-xl border border-slate-200 px-3 py-2">
                  <div className="flex flex-col gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-xs text-slate-500">Người lớn</span>
                      <input
                        type="number"
                        min={1}
                        value={adults}
                        onChange={handleAdultsChange}
                        className="h-8 w-24 rounded-lg border border-slate-200 px-2 text-sm text-slate-900 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-xs text-slate-500">Trẻ em</span>
                      <input
                        type="number"
                        min={0}
                        value={children}
                        onChange={handleChildrenChange}
                        className="h-8 w-24 rounded-lg border border-slate-200 px-2 text-sm text-slate-900 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Tổng cộng {adults + children} khách (bao gồm {adults} người lớn)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Giá phòng ({nights} đêm)</span>
                <span>{pricing.base.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí dịch vụ 10%</span>
                <span>{pricing.serviceFee.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Thuế 8%</span>
                <span>{pricing.tax.toLocaleString('vi-VN')} đ</span>
              </div>
              
              {/* Voucher Selection */}
              <div className="py-2">
                <div className="relative">
                  <select
                    value={selectedVoucher?._id || ''}
                    onChange={(e) => {
                      const voucher = vouchers.find(v => v._id === e.target.value);
                      setSelectedVoucher(voucher || null);
                    }}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:bg-slate-50 disabled:text-slate-400"
                    disabled={vouchers.length === 0}
                  >
                    <option value="">Chọn mã giảm giá</option>
                    {vouchers.map((voucher) => (
                      <option key={voucher._id} value={voucher._id}>
                        {voucher.code} (-{voucher.discountPercentage}%)
                      </option>
                    ))}
                  </select>
                  <Ticket className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
                {vouchers.length > 0 && !selectedVoucher && (
                  <p className="mt-1 text-[10px] text-emerald-600">
                    Bạn có {vouchers.length} mã giảm giá khả dụng
                  </p>
                )}
              </div>

              {pricing.discount > 0 && (
                <div className="flex justify-between font-medium text-emerald-600">
                  <span>Giảm giá</span>
                  <span>-{pricing.discount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}

              <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-sm font-semibold text-slate-900">
                <span>Tổng cộng</span>
                <span>
                  {pricing.total.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <Button className="mt-4 w-full" size="lg" onClick={handleBookNow}>
              Đặt ngay
            </Button>
          </section>

          <section className="rounded-3xl bg-white p-4 shadow-card text-sm text-slate-700">
            <p className="font-medium text-slate-900">Cần trợ giúp?</p>
            <p className="mt-1 text-xs text-slate-500">
              Đội ngũ hỗ trợ TravelNow luôn sẵn sàng 24/7 để hỗ trợ đặt phòng.
            </p>
          </section>
        </aside>
      </div>

      {/* 4. Tiện nghi & Đánh giá - Ở dưới cùng */}
      <div className="space-y-6">
        {hotel.amenities && hotel.amenities.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Tiện nghi nổi bật
            </h2>
            <div className="grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-3">
              {hotel.amenities.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-slate-700"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">
            Đánh giá & Nhận xét
          </h2>
          
          {/* Rating Summary */}
          <div className="grid gap-8 md:grid-cols-[200px_minmax(0,1fr)]">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-6">
              <p className="text-4xl font-bold text-slate-900">
                {averageRating ? averageRating.toFixed(1) : '0.0'}
              </p>
              <div className="mt-2 flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-lg">
                    {star <= averageRating ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-sm font-medium text-slate-600">
                {totalReviews ? `${totalReviews.toLocaleString('vi-VN')} đánh giá` : 'Chưa có đánh giá'}
              </p>
            </div>

            <div className="space-y-3">
              {[
                { key: 'cleanliness', label: 'Sạch sẽ' },
                { key: 'amenities', label: 'Tiện nghi' },
                { key: 'location', label: 'Vị trí' },
                { key: 'service', label: 'Dịch vụ' },
                { key: 'valueForMoney', label: 'Đáng giá tiền' }
              ].map(({ key, label }) => {
                const score = reviewsSummary.criteria?.[key] || averageRating || 0;
                return (
                  <div key={key} className="flex items-center gap-4 text-sm">
                    <span className="w-24 font-medium text-slate-700">{label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-semibold text-slate-900">
                      {score ? score.toFixed(1) : '0.0'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="mt-8 space-y-6 border-t border-slate-100 pt-8">
            {reviews.length === 0 && (
              <p className="text-sm text-slate-500">
                Chưa có đánh giá nào cho khách sạn này. Hãy là người đầu tiên đánh giá!
              </p>
            )}

            {reviews.map((review) => {
              const userInfo = review.user || {};
              const name =
                userInfo.fullName ||
                userInfo.email ||
                'Người dùng ẩn danh';
              const initials = name
                .split(' ')
                .filter(Boolean)
                .slice(-2)
                .map((word) => word.charAt(0).toUpperCase())
                .join('');
              const createdAt = review.createdAt
                ? new Date(review.createdAt).toLocaleDateString('vi-VN')
                : '';

              return (
                <div key={review._id} className="flex gap-4">
                  {userInfo.avatarUrl ? (
                    <img
                      src={userInfo.avatarUrl}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/90 text-xs font-semibold text-white">
                      {initials || 'U'}
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900">{name}</h4>
                      {createdAt && (
                        <span className="text-xs text-slate-500">{createdAt}</span>
                      )}
                    </div>
                    <div className="flex text-yellow-400 text-xs">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>{star <= (review.rating || 0) ? '★' : '☆'}</span>
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Form gửi đánh giá */}
            <form
              onSubmit={handleSubmitReview}
              className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4"
            >
              <p className="text-sm font-semibold text-slate-900">
                Chia sẻ trải nghiệm của bạn
              </p>

              <div className="space-y-2 text-yellow-400">
                {[
                  { key: 'cleanliness', label: 'Sạch sẽ' },
                  { key: 'amenities', label: 'Tiện nghi' },
                  { key: 'location', label: 'Vị trí' },
                  { key: 'service', label: 'Dịch vụ' },
                  { key: 'valueForMoney', label: 'Đáng giá tiền' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-24 text-xs font-medium text-slate-700">
                      {label}
                    </span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setMyRatings((prev) => ({ ...prev, [key]: star }))
                        }
                        className="text-xl focus:outline-none"
                      >
                        {star <= (myRatings[key] || 0) ? '★' : '☆'}
                      </button>
                    ))}
                    <span className="ml-2 text-[11px] text-slate-600">
                      {myRatings[key] ? `${myRatings[key]} / 5` : 'Chọn số sao'}
                    </span>
                  </div>
                ))}
                <p className="text-xs text-slate-500">
                  Điểm trung bình của bạn: {myAverageRating ? myAverageRating.toFixed(1) : '0.0'} / 5
                </p>
              </div>
              <textarea
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                placeholder="Hãy chia sẻ cảm nhận của bạn về khách sạn..."
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  className="px-4"
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HotelDetailPage;
