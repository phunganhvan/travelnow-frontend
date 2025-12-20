import React, { useEffect, useState } from 'react';
import { get, post } from '../../../services/api';
import VoucherCard from '../../molecules/VoucherCard/VoucherCard';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

const PromotionSection = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const { user } = useAuth();

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const data = await get('/vouchers');
      if (Array.isArray(data)) {
        setVouchers(data);
      }
    } catch (error) {
      console.error('Failed to fetch vouchers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [user]); // Refetch when user logs in/out to update 'isClaimed' status

  const handleClaim = async (id) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để nhận voucher');
      return;
    }
    try {
      setClaimingId(id);
      await post(`/vouchers/${id}/claim`);
      toast.success('Nhận voucher thành công!');
      // Update local state
      setVouchers(prev => prev.map(v => v._id === id ? { ...v, isClaimed: true } : v));
    } catch (error) {
      toast.error(error.message || 'Không thể nhận voucher');
    } finally {
      setClaimingId(null);
    }
  };

  const myVouchers = vouchers.filter(v => v.isClaimed);
  const availableVouchers = vouchers.filter(v => !v.isClaimed);

  if (loading && vouchers.length === 0) return null;
  if (vouchers.length === 0) return null;

  return (
    <section className="py-10 bg-slate-50">
      <div className="app-container">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Khuyến mãi & Ưu đãi</h2>
          <p className="mt-2 text-slate-600">Săn voucher giảm giá cực sốc dành riêng cho bạn</p>
        </div>
        
        {myVouchers.length > 0 && (
          <div className="mb-10">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">✓</span>
              Voucher của bạn
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {myVouchers.map(voucher => (
                <VoucherCard key={voucher._id} voucher={voucher} onClaim={handleClaim} />
              ))}
            </div>
          </div>
        )}

        {availableVouchers.length > 0 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-800">Ưu đãi chưa nhận</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {availableVouchers.map(voucher => (
                <VoucherCard 
                  key={voucher._id} 
                  voucher={voucher} 
                  onClaim={handleClaim} 
                  loading={claimingId === voucher._id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PromotionSection;
