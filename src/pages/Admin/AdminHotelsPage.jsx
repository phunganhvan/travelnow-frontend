import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { del, get, post, put } from '../../services/api';

const initialForm = {
  name: '',
  city: '',
  address: '',
  description: '',
  amenities: '',
  pricePerNight: ''
};

const AdminHotelsPage = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
   const [selectedHotel, setSelectedHotel] = useState(null);
   const [editForm, setEditForm] = useState({
     name: '',
     city: '',
     address: '',
     description: '',
     pricePerNight: '',
     imageUrl: '',
     amenities: ''
   });

  const fetchHotels = () => {
    setLoading(true);
    get('/admin/hotels')
      .then((data) => {
        setHotels(data.hotels || []);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Không tải được danh sách khách sạn');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      setImagePreviews([]);
      return;
    }

    setImagePreviews([]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSetPrimaryPreview = (index) => {
    setImagePreviews((prev) => {
      if (!prev || index < 0 || index >= prev.length) return prev;
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      return [chosen, ...copy];
    });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      name: form.name,
      city: form.city,
      address: form.address,
      description: form.description,
      pricePerNight: Number(form.pricePerNight) || 0,
      amenities: form.amenities
        ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean)
        : [],
      imageDataUrls: imagePreviews
    };

    post('/admin/hotels', payload)
      .then(() => {
        setForm(initialForm);
        setImagePreviews([]);
        fetchHotels();
      })
      .catch((err) => {
        setError(err.message || 'Không thêm được khách sạn');
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khách sạn này?')) return;
    del(`/admin/hotels/${id}`)
      .then(fetchHotels)
      .catch(() => {});
  };

  const handleQuickPriceUpdate = (hotel, delta) => {
    const newPrice = (hotel.pricePerNight || 0) + delta;
    if (newPrice <= 0) return;
    put(`/admin/hotels/${hotel._id}`, { pricePerNight: newPrice })
      .then(fetchHotels)
      .catch(() => {});
  };

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
    setEditForm({
      name: hotel.name || '',
      city: hotel.city || '',
      address: hotel.address || '',
      description: hotel.description || '',
      pricePerNight: hotel.pricePerNight?.toString() || '',
      imageUrl: hotel.imageUrl || '',
      amenities: (hotel.amenities || []).join(', ')
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateHotel = (e) => {
    e.preventDefault();
    if (!selectedHotel) return;

    const payload = {
      name: editForm.name,
      city: editForm.city,
      address: editForm.address,
      description: editForm.description,
      pricePerNight: Number(editForm.pricePerNight) || 0,
      imageUrl: editForm.imageUrl,
      amenities: editForm.amenities
        ? editForm.amenities.split(',').map((a) => a.trim()).filter(Boolean)
        : []
    };

    put(`/admin/hotels/${selectedHotel._id}`, payload)
      .then(() => {
        fetchHotels();
      })
      .catch(() => {
        // lỗi đã log ở api layer
      });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Quản lý khách sạn</h2>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-lg shadow p-4 space-y-3 text-sm"
      >
        <h3 className="font-medium">Thêm khách sạn mới</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tên khách sạn
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Thành phố
            </label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Giá / đêm
            </label>
            <input
              type="number"
              name="pricePerNight"
              value={form.pricePerNight}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              min={0}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Địa chỉ
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tiện nghi (cách nhau bởi dấu phẩy)
            </label>
            <input
              name="amenities"
              value={form.amenities}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Wifi, Bữa sáng miễn phí, ..."
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm min-h-[80px]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Ảnh khách sạn (có thể chọn nhiều ảnh)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            className="text-xs"
          />
          {imagePreviews.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {imagePreviews.map((src, index) => {
                const isPrimary = index === 0;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSetPrimaryPreview(index)}
                    className={`relative focus:outline-none ${
                      isPrimary ? 'ring-2 ring-blue-500 rounded' : ''
                    }`}
                    title={
                      isPrimary
                        ? 'Ảnh đại diện (ảnh chính)'
                        : 'Bấm để đặt làm ảnh đại diện'
                    }
                  >
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="w-16 h-16 rounded object-cover border"
                    />
                    {isPrimary && (
                      <span className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-[10px] text-white text-center rounded-b">
                        Ảnh đại diện
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
        >
          {submitting ? 'Đang lưu...' : 'Thêm khách sạn'}
        </button>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </form>

      <div className="bg-white rounded-lg shadow p-4 text-sm">
        <h3 className="font-medium mb-3">Danh sách khách sạn</h3>
        {loading ? (
          <p className="text-gray-500 text-sm">Đang tải...</p>
        ) : hotels.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có khách sạn nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2">Tên</th>
                  <th className="px-3 py-2">Thành phố</th>
                  <th className="px-3 py-2">Giá / đêm</th>
                  <th className="px-3 py-2">Đánh giá</th>
                  <th className="px-3 py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((h) => (
                  <tr
                    key={h._id}
                    className="border-t cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSelectHotel(h)}
                  >
                    <td className="px-3 py-2">{h.name}</td>
                    <td className="px-3 py-2">{h.city}</td>
                    <td className="px-3 py-2">
                      {(h.pricePerNight || 0).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-3 py-2">{h.rating ?? '-'} ★</td>
                    <td className="px-3 py-2 text-right space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/hotels/${h._id}`);
                        }}
                        className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Chi tiết
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/hotels/${h._id}/edit`);
                        }}
                        className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(h._id);
                        }}
                        className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedHotel && (
        <form
          onSubmit={handleUpdateHotel}
          className="bg-white rounded-lg shadow p-4 space-y-3 text-sm"
        >
          <h3 className="font-medium">
            Chi tiết khách sạn: {selectedHotel.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tên khách sạn
              </label>
              <input
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Thành phố
              </label>
              <input
                name="city"
                value={editForm.city}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Giá / đêm
              </label>
              <input
                type="number"
                name="pricePerNight"
                value={editForm.pricePerNight}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm"
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Địa chỉ
              </label>
              <input
                name="address"
                value={editForm.address}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Mô tả
              </label>
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Ảnh đại diện (URL)
              </label>
              <input
                name="imageUrl"
                value={editForm.imageUrl}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm mb-2"
              />
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tiện ích (cách nhau bằng dấu phẩy)
              </label>
              <textarea
                name="amenities"
                value={editForm.amenities}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm"
                rows={2}
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 bg-green-600 text-white rounded text-sm"
          >
            Lưu thay đổi
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminHotelsPage;
