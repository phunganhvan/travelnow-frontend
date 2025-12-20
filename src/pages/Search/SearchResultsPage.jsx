import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { get } from '../../services/api';
import Button from '../../components/atoms/Button/Button';
import { toast } from 'react-hot-toast';
import { demoHotels as demoHotelsData } from '../../data/demoHotels';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const SearchResultsPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const destination = query.get('destination') || '';
  const checkIn = query.get('checkIn') || '';
  const checkOut = query.get('checkOut') || '';
  const guests = query.get('guests') || '';
  const [allHotels, setAllHotels] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedStar, setSelectedStar] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const AMENITY_FILTERS = useMemo(
    () => ['Hồ bơi', 'Bữa sáng miễn phí', 'Gần biển', 'Đưa đón sân bay'],
    []
  );

  const applyFilters = (source, star, amenities) => {
    let result = [...source];

    if (star) {
      result = result.filter((hotel) => {
        const hotelStars = hotel.stars || Math.round(hotel.rating || 0);
        return hotelStars === star;
      });
    }

    if (amenities.length > 0) {
      result = result.filter((hotel) => {
        const hotelAmenities = hotel.amenities || [];
        return amenities.every((a) => hotelAmenities.includes(a));
      });
    }

    return result;
  };

  const getPriceRangeText = (hotel) => {
    let minPrice;
    let maxPrice;

    if (hotel.rooms && hotel.rooms.length > 0) {
      const prices = hotel.rooms
        .map((room) => room.price)
        .filter((p) => typeof p === 'number' && p > 0);
      if (prices.length > 0) {
        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
      }
    }

    if (minPrice == null && typeof hotel.pricePerNight === 'number') {
      minPrice = hotel.pricePerNight;
      maxPrice = hotel.pricePerNight;
    }

    if (minPrice == null) return '—';

    const minText = minPrice.toLocaleString('vi-VN');
    const maxText = maxPrice.toLocaleString('vi-VN');

    if (minPrice === maxPrice) return `${minText} đ`;
    return `${minText} - ${maxText} đ`;
  };

  useEffect(() => {
    async function fetchHotels() {
      if (!destination) {
        setAllHotels(demoHotelsData);
        setHotels(applyFilters(demoHotelsData, selectedStar, selectedAmenities));
        return;
      }
      try {
        setLoading(true);
        const params = new URLSearchParams({
          destination,
          checkIn,
          checkOut,
          guests
        });
        const data = await get(`/hotels/search?${params.toString()}`);
        const results =
          data.hotels && data.hotels.length > 0 ? data.hotels : demoHotelsData;
        setAllHotels(results);
        setHotels(applyFilters(results, selectedStar, selectedAmenities));
      } catch (error) {
        toast.error(error.message || 'Không thể tải danh sách khách sạn');
        setAllHotels(demoHotelsData);
        setHotels(applyFilters(demoHotelsData, selectedStar, selectedAmenities));
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
  }, [destination, checkIn, checkOut, guests, selectedStar, selectedAmenities]);

  const handleStarClick = (star) => {
    setSelectedStar((prev) => (prev === star ? null : star));
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="app-container pt-24 pb-10">
      <div className="mb-4 text-sm text-slate-500">Hotel Search Results</div>

      <div className="rounded-3xl bg-white shadow-card">
        {/* Header summary */}
        <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {destination || 'Chọn điểm đến'}
            </h1>
            <p className="text-xs text-slate-500">
              {guests && <span>{guests}</span>}
              {guests && (checkIn || checkOut) && ' • '}
              {checkIn && checkOut
                ? `Từ ${checkIn} đến ${checkOut}`
                : checkIn || checkOut}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-50 px-3 py-1">
              {hotels.length} chỗ nghỉ tìm thấy
            </span>
            <Button size="sm" variant="outline" className="rounded-full border-slate-200">
              Sắp xếp
            </Button>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-[260px_minmax(0,1fr)]">
          {/* Filters (static UI) */}
          <aside className="space-y-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase text-slate-400">
                Bộ lọc
              </p>
              <p className="text-sm font-medium text-slate-900">Khoảng giá</p>
              <div className="h-1 rounded-full bg-slate-200" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">Xếp hạng sao</p>
              <div className="flex flex-wrap gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                      selectedStar === star
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 text-slate-700 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {star}★
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">Tiện nghi</p>
              <div className="space-y-1">
                {AMENITY_FILTERS.map((label) => (
                  <label key={label} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300"
                      checked={selectedAmenities.includes(label)}
                      onChange={() => handleAmenityToggle(label)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Results list */}
          <section className="space-y-3">
            {loading && (
              <div className="py-10 text-center text-sm text-slate-500">
                Đang tải danh sách chỗ nghỉ...
              </div>
            )}
            {!loading &&
              hotels.map((hotel) => (
                <article
                  key={hotel._id}
                  className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:flex-row"
                  onClick={() => navigate(`/hotel/${hotel._id}`, { state: { hotel } })}
                >
                  <div className="h-40 w-full overflow-hidden rounded-2xl bg-slate-100 md:w-48">
                    {hotel.imageUrl && (
                      <img
                        src={hotel.imageUrl}
                        alt={hotel.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-2 md:flex-row">
                    <div className="space-y-1 text-sm">
                      <p className="text-[11px] font-semibold uppercase text-slate-400">
                        HOTEL
                      </p>
                      <h2 className="text-base font-semibold text-slate-900">
                        {hotel.name}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {hotel.city}
                        {hotel.distanceFromCenterKm
                          ? ` • Cách trung tâm ${hotel.distanceFromCenterKm} km`
                          : ''}
                      </p>
                      {hotel.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {hotel.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-between gap-2 text-right text-sm">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {typeof hotel.rating === 'number' && hotel.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                              {hotel.rating.toFixed(1)}
                            </span>
                            {hotel.reviewCount ? (
                              <span>{hotel.reviewCount} đánh giá</span>
                            ) : null}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Giá mỗi đêm từ</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {getPriceRangeText(hotel)}
                        </p>
                      </div>

                      <Button size="sm" className="rounded-full px-4 py-1">
                        Đặt ngay
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
