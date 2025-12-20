import React from 'react';
import Button from '../../atoms/Button/Button';
import { Ticket } from 'lucide-react';

const VoucherCard = ({ voucher, onClaim, loading }) => {
  const { code, description, discountPercentage, isClaimed } = voucher;

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      {/* Decorative circles for ticket look */}
      <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-slate-50 border-r border-slate-200"></div>
      <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-slate-50 border-l border-slate-200"></div>
      
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Ticket size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">{code}</h3>
          <p className="text-xs font-medium text-primary">Giảm {discountPercentage}%</p>
        </div>
      </div>
      
      <p className="mb-4 text-xs text-slate-500 line-clamp-2 min-h-[2.5em]">{description}</p>
      
      {isClaimed ? (
        <Button variant="outline" size="sm" className="w-full border-primary text-primary bg-primary/5 cursor-default hover:bg-primary/5">
          Đã nhận
        </Button>
      ) : (
        <Button 
          size="sm" 
          className="w-full" 
          onClick={() => onClaim(voucher._id)}
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Nhận ngay'}
        </Button>
      )}
    </div>
  );
};

export default VoucherCard;
