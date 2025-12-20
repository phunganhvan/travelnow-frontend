import React from 'react';
import HeroSearchForm from '../../components/molecules/HeroSearchForm/HeroSearchForm';
import OfferCard from '../../components/molecules/cards/OfferCard';
import DestinationCard from '../../components/molecules/cards/DestinationCard';
import Footer from '../../components/molecules/Footer/Footer';
import { useForm, Controller } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImagePreview from '../../components/atoms/ImagePreview/ImagePreview';
import { useImagePreview } from '../../hooks/useImagePreview';
import TextInput from '../../components/atoms/inputs/TextInput';
import Button from '../../components/atoms/Button/Button';
import { toast } from 'react-hot-toast';

/**
 * Trang chủ: gồm hero + form tìm kiếm + các section ưu đãi & điểm đến + form demo có upload ảnh & editor.
 */
const HomePage = () => {
  const {
    file,
    previewUrl,
    onFileChange,
    clearImage
  } = useImagePreview();

  const {
    handleSubmit,
    control,
    reset
  } = useForm({
    defaultValues: {
      title: '',
      description: ''
    }
  });

  const onSubmitDealForm = (values) => {
    // Payload demo: dữ liệu + file ảnh
    console.log('Deal form submit', { ...values, file });
    toast.success('Đã gửi ưu đãi demo');
    reset();
    clearImage();
  };

  const offers = [
    {
      id: 1,
      tagLabel: 'Chào Hè',
      tagColor: 'green',
      title: 'Mùa hè Bali',
      description:
        'Trải nghiệm thiên đường nhiệt đới với ưu đãi giảm 20% cho các khu nghỉ dưỡng trong tháng này.',
      ctaLabel: 'Nhận ưu đãi',
      imageUrl:
        'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      id: 2,
      tagLabel: 'Đặt sớm',
      tagColor: 'blue',
      title: 'Kỳ nghỉ Santorini',
      description:
        'Đặt trước 60 ngày để nhận miễn phí du thuyền ăn tối ngắm hoàng hôn.',
      ctaLabel: 'Đặt ngay',
      imageUrl:
        'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      id: 3,
      tagLabel: 'Giờ vàng',
      tagColor: 'yellow',
      title: 'Phiêu lưu Tokyo',
      description:
        'Ưu đãi có hạn: Tặng thẻ JR Pass khi đặt phòng 5 đêm tại Shinjuku.',
      ctaLabel: 'Lấy mã',
      imageUrl:
        'https://images.pexels.com/photos/373290/pexels-photo-373290.jpeg?auto=compress&cs=tinysrgb&w=1200',
      floatingIcon: true
    }
  ];

  const destinations = [
    {
      id: 1,
      name: 'Paris',
      imageUrl:
        'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      id: 2,
      name: 'Rome',
      imageUrl:
        'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      id: 3,
      name: 'New York',
      imageUrl:
        'https://images.pexels.com/photos/313782/pexels-photo-313782.jpeg?auto=compress&cs=tinysrgb&w=1200'
    },
    {
      id: 4,
      name: 'Đà Nẵng',
      imageUrl:
        'https://images.pexels.com/photos/2486168/pexels-photo-2486168.jpeg?auto=compress&cs=tinysrgb&w=1200'
    }
  ];

  return (
    <div className="pb-10">
      {/* HERO */}
      <section className="relative min-h-[420px] bg-slate-900">
        <div className="absolute inset-0 app-gradient-hero">
          {/* Background illustration có thể thêm hình núi / pattern */}
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-30 mix-blend-soft-light" />
        </div>
        <div className="relative pt-28 pb-28">
          <div className="app-container grid gap-10 lg:grid-cols-[1.2fr_minmax(0,1fr)] lg:items-center">
            <div className="space-y-6 text-white">
              <p className="inline-flex rounded-full bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100 backdrop-blur">
                Khám phá thế giới dễ dàng hơn
              </p>
              <h1 className="max-w-xl text-3xl font-semibold leading-snug tracking-tight sm:text-4xl lg:text-5xl">
                Khám phá thế giới theo cách của bạn
              </h1>
              <p className="max-w-lg text-sm text-slate-200 leading-relaxed sm:text-base">
                Tìm những ưu đãi tốt nhất cho khách sạn, chuyến bay và
                hoạt động trên toàn cầu. Lên kế hoạch cho chuyến đi
                tiếp theo chỉ trong vài phút.
              </p>
            </div>

            <div className="hidden lg:block" />
          </div>

          <div className="mt-10 flex justify-center">
            <HeroSearchForm />
          </div>
        </div>
      </section>

      <div className="app-container mt-12 space-y-16">
        {/* Ưu đãi đặc biệt */}
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                Ưu đãi đặc biệt
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Chọn từ các gói nghỉ dưỡng được chúng tôi tuyển chọn
                kỹ lưỡng.
              </p>
            </div>
            <button className="hidden text-sm font-semibold text-primary hover:text-primaryDark md:inline-flex">
              Xem tất cả ưu đãi &rarr;
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} {...offer} />
            ))}
          </div>

          <button className="mt-2 w-full text-center text-sm font-semibold text-primary hover:text-primaryDark md:hidden">
            Xem tất cả ưu đãi &rarr;
          </button>
        </section>

        {/* Điểm đến phổ biến */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Điểm đến phổ biến
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Được yêu thích bởi hàng triệu du khách trên toàn thế
              giới.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} {...destination} />
            ))}
          </div>
        </section>

        {/* Đã bỏ form demo tạo ưu đãi để giao diện gọn hơn */}
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;