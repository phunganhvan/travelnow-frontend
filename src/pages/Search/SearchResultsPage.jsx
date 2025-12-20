import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { get } from '../../services/api';
import Button from '../../components/atoms/Button/Button';
import { toast } from 'react-hot-toast';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const SearchResultsPage = () => {
  const location = useLocation();
  const query = useQuery();
  const navigate = useNavigate();
  const destination = query.get('destination') || '';
  const checkIn = query.get('checkIn') || '';
  const checkOut = query.get('checkOut') || '';
  const guests = query.get('guests') || '';
  const [allHotels, setAllHotels] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchDestination, setSearchDestination] = useState(destination);

  useEffect(() => {
    setSearchDestination(destination);
  }, [destination]);

  const handleSearchDestination = () => {
    const params = new URLSearchParams(location.search);
    if (searchDestination.trim()) {
      params.set('destination', searchDestination.trim());
    } else {
      params.delete('destination');
    }
    navigate(`/search?${params.toString()}`);
  };

  const AMENITY_FILTERS = useMemo(
    () => ['Hồ bơi', 'Bữa sáng miễn phí', 'Gần biển', 'Đưa đón sân bay'],
    []
  );

  const PRICE_RANGES = useMemo(
    () => [
      { id: 'all', label: 'Tất cả', min: 0, max: Infinity },
      { id: 'under-1m', label: 'Dưới 1 triệu', min: 0, max: 1000000 },
      { id: '1m-3m', label: '1 triệu - 3 triệu', min: 1000000, max: 3000000 },
      { id: '3m-5m', label: '3 triệu - 5 triệu', min: 3000000, max: 5000000 },
      { id: 'above-5m', label: 'Trên 5 triệu', min: 5000000, max: Infinity }
    ],
    []
  );

  const [selectedStar, setSelectedStar] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(() => PRICE_RANGES[0]);

  const getPrimaryImage = (hotel) => {
    if (Array.isArray(hotel.imageUrls) && hotel.imageUrls.length > 0) {
      return hotel.imageUrls.find(Boolean) || hotel.imageUrl;
    }
    if (Array.isArray(hotel.photos) && hotel.photos.length > 0) {
      return hotel.photos.find(Boolean) || hotel.imageUrl;
    }
    return hotel.imageUrl;
  };

  const applyFilters = (source, star, amenities, priceRange) => {
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

    if (priceRange && priceRange.id !== 'all') {
      result = result.filter((hotel) => {
        // Lấy giá thấp nhất của khách sạn để so sánh
        let minPrice = hotel.pricePerNight;
        if (hotel.rooms && hotel.rooms.length > 0) {
          const prices = hotel.rooms
            .map((room) => room.price)
            .filter((p) => typeof p === 'number' && p > 0);
          if (prices.length > 0) {
            minPrice = Math.min(...prices);
          }
        }
        if (minPrice == null) return false;
        return minPrice >= priceRange.min && minPrice < priceRange.max;
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
    let ignore = false;

    async function fetchHotels() {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (destination) params.set('destination', destination);
        if (checkIn) params.set('checkIn', checkIn);
        if (checkOut) params.set('checkOut', checkOut);
        if (guests) params.set('guests', guests);

        const queryString = params.toString();
        const endpoint = queryString ? `/hotels/search?${queryString}` : '/hotels/search';

        const data = await get(endpoint);
        const results = Array.isArray(data?.hotels)
          ? data.hotels
          : Array.isArray(data)
            ? data
            : [];

        if (!ignore) {
          setAllHotels(results);
        }
      } catch (error) {
        if (!ignore) {
          toast.error(error.message || 'Không thể tải danh sách khách sạn');
          setAllHotels([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchHotels();

    return () => {
      ignore = true;
    };
  }, [destination, checkIn, checkOut, guests]);

  useEffect(() => {
    setHotels(applyFilters(allHotels, selectedStar, selectedAmenities, selectedPriceRange));
  }, [allHotels, selectedStar, selectedAmenities, selectedPriceRange]);

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
                Tìm kiếm
              </p>
              <p className="text-sm font-medium text-slate-900">Điểm đến</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchDestination()}
                  placeholder="Nhập điểm đến..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-primary focus:outline-none"
                />
                <Button size="sm" onClick={handleSearchDestination}>
                  Tìm
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase text-slate-400">
                Bộ lọc
              </p>
              <p className="text-sm font-medium text-slate-900">Khoảng giá</p>
              <div className="space-y-1">
                {PRICE_RANGES.map((range) => (
                  <label key={range.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priceRange"
                      className="h-3.5 w-3.5 border-slate-300 text-primary focus:ring-primary"
                      checked={selectedPriceRange?.id === range.id}
                      onChange={() => setSelectedPriceRange(range)}
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
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
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-slate-200 text-slate-700 hover:border-yellow-500 hover:text-yellow-600'
                    }`}
                  >
                    {star} <span className="text-yellow-500">★</span>
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
            {!loading && hotels.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-500">
                Không tìm thấy khách sạn phù hợp. Hãy thử điều chỉnh bộ lọc.
              </div>
            )}
            {!loading &&
              hotels.map((hotel) => {
                const primaryImage = getPrimaryImage(hotel);
                return (
                <article
                  key={hotel._id}
                  className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:flex-row"
                  onClick={() => navigate(`/hotel/${hotel._id}`, { state: { hotel } })}
                >
                  <div className="h-40 w-full overflow-hidden rounded-2xl bg-slate-100 md:w-48">
                    {primaryImage && (
                      <img
                        src={primaryImage}
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
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
