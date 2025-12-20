export const demoHotels = [
  {
    _id: 'demo-1',
    name: 'Grand Plaza Hotel & Spa',
    city: 'Đà Nẵng',
    address: '123 Đường Biển, Sơn Trà, Đà Nẵng',
    description:
      'Khách sạn nghỉ dưỡng cao cấp với hồ bơi vô cực, spa và tầm nhìn toàn cảnh biển.',
    pricePerNight: 6000000,
    currency: 'VND',
    rating: 4.8,
    reviewCount: 1200,
    stars: 5,
    distanceFromCenterKm: 1.5,
    imageUrl:
      'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800',
    amenities: [
      'Wi-Fi miễn phí',
      'Hồ bơi',
      'Spa',
      'Nhà hàng',
      'Gym',
      'Bãi đậu xe',
      'Đưa đón sân bay'
    ],
    photos: [
      'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/2581549/pexels-photo-2581549.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=1200'
    ],
    rooms: [
      {
        id: 'room-1',
        name: 'Phòng Deluxe King',
        size: '42 m²',
        bedInfo: '1 giường đôi lớn',
        guests: '2 người lớn',
        extras: ['Hủy miễn phí', 'Bao gồm bữa sáng'],
        price: 6000000
      },
      {
        id: 'room-2',
        name: 'Phòng Suite Hướng Biển',
        size: '65 m²',
        bedInfo: '1 giường đôi lớn',
        guests: '3 người',
        extras: ['Giá tốt nhất', 'Bao gồm bữa sáng', 'Ban công riêng'],
        price: 10800000
      }
    ],
    ratingBreakdown: {
      excellent: 75,
      veryGood: 18,
      good: 5,
      average: 1,
      poor: 1
    }
  },
  {
    _id: 'demo-2',
    name: 'Urban Boutique Hotel',
    city: 'Đà Nẵng',
    address: '45 Đống Đa, Hải Châu, Đà Nẵng',
    description:
      'Khách sạn phong cách boutique, nằm gần trung tâm, phù hợp cho chuyến đi công tác hoặc nghỉ cuối tuần.',
    pricePerNight: 4200000,
    currency: 'VND',
    rating: 4.6,
    reviewCount: 320,
    stars: 4,
    distanceFromCenterKm: 0.8,
    imageUrl:
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
    amenities: ['Wi-Fi miễn phí', 'Nhà hàng', 'Gym', 'Bãi đậu xe'],
    photos: [],
    rooms: [],
    ratingBreakdown: null
  },
  {
    _id: 'demo-3',
    name: 'City View Inn Đà Nẵng',
    city: 'Đà Nẵng',
    address: '12 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    description:
      'Khách sạn nhỏ ấm cúng với tầm nhìn thành phố, gần sông Hàn và cầu Rồng.',
    pricePerNight: 2100000,
    currency: 'VND',
    rating: 4.4,
    reviewCount: 150,
    stars: 3,
    distanceFromCenterKm: 2.3,
    imageUrl:
      'https://images.pexels.com/photos/373290/pexels-photo-373290.jpeg?auto=compress&cs=tinysrgb&w=800',
    amenities: ['Wi-Fi miễn phí', 'Bãi đậu xe'],
    photos: [],
    rooms: [],
    ratingBreakdown: null
  }
];
