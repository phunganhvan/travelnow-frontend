import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { get } from '../../services/api';
import Button from '../../components/atoms/Button/Button';
import { demoHotels } from '../../data/demoHotels';

const findDemoHotel = (id) => demoHotels.find((h) => h._id === id) || null;

const HotelDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [hotel, setHotel] = useState(() => location.state?.hotel || findDemoHotel(id));
  const [loading, setLoading] = useState(false);

  const mainPhoto = useMemo(() => {
    if (!hotel) return null;
    if (hotel.photos && hotel.photos.length > 0) return hotel.photos[0];
    return hotel.imageUrl || null;
  }, [hotel]);

  useEffect(() => {
    async function fetchHotel() {
      if (!id) return;
      // Nếu đã có dữ liệu từ state hoặc demo thì không cần fetch nữa
      if (hotel && hotel._id === id) return;

      try {
        setLoading(true);
        const data = await get(`/hotels/${id}`);
        setHotel(data);
      } catch (error) {
        const fallback = findDemoHotel(id);
        if (fallback) {
          setHotel(fallback);
        } else {
          toast.error('Không thể tải thông tin khách sạn');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchHotel();
  }, [id, hotel]);

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

  const ratingText = hotel.rating ? `${hotel.rating.toFixed(1)} / 5` : 'Chưa có đánh giá';

  return (
    <div className="app-container pt-24 pb-10">
      {/* Hàng trên: ảnh + card giá */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        {/* Khối ảnh lớn bên trái */}
        <div>
          <div className="grid gap-2 rounded-3xl bg-slate-100 p-2 md:h-[380px] md:grid-cols-[2fr_1fr]">
            <div className="relative h-56 overflow-hidden rounded-2xl bg-slate-200 md:h-full">
              {mainPhoto && (
                <img
                  src={mainPhoto}
                  alt={hotel.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="hidden h-full grid-rows-3 gap-2 md:grid">
              {(hotel.photos || []).slice(1, 4).map((url, index) => (
                <div
                  key={url || index}
                  className="overflow-hidden rounded-2xl bg-slate-200"
                >
                  {url && (
                    <img
                      src={url}
                      alt={hotel.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột giá + đặt phòng bên phải */}
        <aside className="space-y-4">
          <section className="rounded-3xl bg-white p-6 shadow-card">
            <p className="text-xs font-medium uppercase text-slate-400">Giá mỗi đêm</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {hotel.pricePerNight?.toLocaleString('vi-VN')} đ
              <span className="text-sm font-normal text-slate-500"> / đêm</span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div>
                <p className="mb-1 font-medium text-slate-800">Nhận phòng</p>
                <div className="rounded-xl border border-slate-200 px-3 py-2">
                  <p>12 Th10, 2023</p>
                </div>
              </div>
              <div>
                <p className="mb-1 font-medium text-slate-800">Trả phòng</p>
                <div className="rounded-xl border border-slate-200 px-3 py-2">
                  <p>16 Th10, 2023</p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="mb-1 font-medium text-slate-800">Khách</p>
                <div className="rounded-xl border border-slate-200 px-3 py-2">
                  <p>2 người lớn, 0 trẻ em</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Giá phòng (4 đêm)</span>
                <span>{(hotel.pricePerNight * 4).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí dịch vụ 10%</span>
                <span>{(hotel.pricePerNight * 0.4).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Thuế 8%</span>
                <span>{(hotel.pricePerNight * 0.32).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-sm font-semibold text-slate-900">
                <span>Tổng cộng</span>
                <span>
                  {Math.round(hotel.pricePerNight * 1.82 * 4).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <Button className="mt-4 w-full" size="lg">
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

      {/* Phần mô tả, tiện nghi, phòng, đánh giá ở HÀNG DƯỚI, full width */}
      <div className="mt-6 space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {hotel.name}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {hotel.city}
                {hotel.address ? ` • ${hotel.address}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {hotel.stars && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  {`${'★'.repeat(hotel.stars)} (${hotel.stars} sao)`}
                </span>
              )}
              {hotel.rating && (
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-primary px-3 py-1 text-xs font-semibold text-white">
                    {hotel.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">
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
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {hotel.rooms && hotel.rooms.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Các phòng trống
            </h2>
            <div className="space-y-4">
              {hotel.rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1 text-sm text-slate-700">
                    <p className="text-base font-semibold text-slate-900">
                      {room.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {room.bedInfo} • {room.size} • {room.guests}
                    </p>
                    {room.extras && room.extras.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1 text-xs">
                        {room.extras.map((extra) => (
                          <span
                            key={extra}
                            className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                          >
                            {extra}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Giá cho 1 đêm</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {room.price?.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <Button size="sm" className="rounded-full px-4 py-1">
                      Chọn phòng
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {hotel.ratingBreakdown && (
          <section className="rounded-3xl bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Đánh giá của khách
            </h2>
            <div className="grid gap-6 md:grid-cols-[160px_minmax(0,1fr)]">
              <div className="flex flex-col items-center justify-center">
                <p className="text-3xl font-semibold text-slate-900">
                  {hotel.rating.toFixed(1)}
                </p>
                <p className="text-xs text-slate-500">{ratingText}</p>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                {[
                  ['Tuyệt vời', hotel.ratingBreakdown.excellent],
                  ['Rất tốt', hotel.ratingBreakdown.veryGood],
                  ['Tốt', hotel.ratingBreakdown.good],
                  ['Trung bình', hotel.ratingBreakdown.average],
                  ['Kém', hotel.ratingBreakdown.poor]
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-24">{label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${value || 0}%` }}
                      />
                    </div>
                    <span className="w-10 text-right">{value || 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HotelDetailPage;
