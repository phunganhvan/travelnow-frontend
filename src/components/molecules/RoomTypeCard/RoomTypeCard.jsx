import React from 'react';
import { Users, Bed, Maximize2, Check } from 'lucide-react';
import Button from '../../atoms/Button/Button';

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const RoomTypeCard = ({ roomType, onSelect, selected, nights = 1 }) => {
  const totalPrice = roomType.pricePerNight * nights;
  const isAvailable = roomType.availableRooms > 0;
  const isLowStock = roomType.availableRooms <= 2 && roomType.availableRooms > 0;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
        selected
          ? 'border-primary bg-primary/5 shadow-md'
          : isAvailable
          ? 'border-slate-200 bg-white hover:border-primary/50 hover:shadow-sm'
          : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
      }`}
      onClick={() => isAvailable && onSelect(roomType)}
    >
      {!isAvailable && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
          <span className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-bold text-white">
            Đã hết phòng
          </span>
        </div>
      )}

      {selected && (
        <div className="absolute right-3 top-3 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-lg">
          <Check size={14} />
        </div>
      )}

      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-base font-bold text-slate-900 line-clamp-1">{roomType.name}</h3>
          {roomType.description && (
            <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{roomType.description}</p>
          )}
        </div>

        <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-600">
          {roomType.maxGuests && (
            <div className="flex items-center gap-1">
              <Users size={14} className="text-primary" />
              <span>{roomType.maxGuests} khách</span>
            </div>
          )}
          {roomType.bedType && (
            <div className="flex items-center gap-1">
              <Bed size={14} className="text-primary" />
              <span className="line-clamp-1">{roomType.bedType}</span>
            </div>
          )}
          {roomType.size && (
            <div className="flex items-center gap-1">
              <Maximize2 size={14} className="text-primary" />
              <span>{roomType.size}m²</span>
            </div>
          )}
        </div>

        {roomType.amenities && roomType.amenities.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1.5">
              {roomType.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
                >
                  {amenity}
                </span>
              ))}
              {roomType.amenities.length > 3 && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                  +{roomType.amenities.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mb-3 rounded-lg bg-slate-50 p-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[10px] text-slate-500">Giá mỗi đêm</p>
              <p className="text-base font-bold text-primary">{formatCurrency(roomType.pricePerNight)}</p>
            </div>
            {nights > 1 && (
              <div className="text-right">
                <p className="text-[10px] text-slate-500">{nights} đêm</p>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(totalPrice)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-600">Còn lại:</span>
          <span
            className={`font-semibold ${
              isLowStock ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {roomType.availableRooms}/{roomType.totalRooms} phòng
            {isLowStock && ' 🔥'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoomTypeCard;
