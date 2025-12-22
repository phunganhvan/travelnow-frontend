import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { get, put } from '../../services/api';

const AdminHotelEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    description: '',
    pricePerNight: '',
    imageUrl: '',
    amenities: '',
    virtualTourUrl: ''
  });
  const [rooms, setRooms] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  useEffect(() => {
    async function fetchHotel() {
      try {
        setLoading(true);
        setError('');
        const data = await get(`/admin/hotels/${id}`);
        const hotel = data.hotel;
        if (!hotel) {
          setError('Không tìm thấy khách sạn');
          setLoading(false);
          return;
        }

        setForm({
          name: hotel.name || '',
          city: hotel.city || '',
          address: hotel.address || '',
          description: hotel.description || '',
          pricePerNight: hotel.pricePerNight != null ? String(hotel.pricePerNight) : '',
          imageUrl: hotel.imageUrl || '',
          amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : '',
          virtualTourUrl: hotel.virtualTourUrl || ''
        });

        const urls = Array.isArray(hotel.imageUrls)
          ? hotel.imageUrls.filter(Boolean)
          : [];
        if (urls.length > 0) {
          setExistingImages(urls);
        } else if (hotel.imageUrl) {
          setExistingImages([hotel.imageUrl]);
        } else {
          setExistingImages([]);
        }
        setNewImagePreviews([]);

        setRooms(Array.isArray(hotel.roomTypes) ? hotel.roomTypes.map((r) => ({
          id: r._id || r.id || undefined,
          name: r.name || '',
          pricePerNight: r.pricePerNight != null ? String(r.pricePerNight) : '',
          maxGuests: r.maxGuests != null ? String(r.maxGuests) : '',
          totalRooms: r.totalRooms != null ? String(r.totalRooms) : ''
        })) : []);
      } catch (err) {
        setError(err.message || 'Không tải được thông tin khách sạn');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchHotel();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/admin/hotels');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomChange = (index, field, value) => {
    setRooms((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddRoom = () => {
    setRooms((prev) => [
      ...prev,
      {
        id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: '',
        pricePerNight: '',
        maxGuests: '',
        totalRooms: ''
      }
    ]);
  };

  const handleRemoveRoom = (index) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const handleSetPrimaryExistingImage = (url) => {
    setExistingImages((prev) => {
      const filtered = prev.filter((u) => u !== url);
      return [url, ...filtered];
    });
    setForm((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveNewImage = (index) => {
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        name: form.name,
        city: form.city,
        address: form.address,
        description: form.description,
        pricePerNight: Number(form.pricePerNight) || 0,
        imageUrl: form.imageUrl,
        virtualTourUrl: form.virtualTourUrl,
        amenities: form.amenities
          ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
        imageUrls: existingImages,
        imageDataUrls: newImagePreviews,
        roomTypes: rooms.map((room, index) => ({
          id: room.id || room._id || `room-${index}-${Date.now()}`,
          name: room.name,
          pricePerNight: Number(room.pricePerNight) || 0,
          maxGuests: room.maxGuests ? Number(room.maxGuests) : undefined,
          totalRooms: room.totalRooms ? Number(room.totalRooms) : undefined
        }))
      };

      await put(`/admin/hotels/${id}`, payload);
      toast.success('Cập nhật khách sạn thành công');
    } catch (err) {
      setError(err.message || 'Không lưu được thông tin khách sạn');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Đang tải thông tin khách sạn...</p>;
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleBack}
        className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
      >
        ← Quay lại danh sách
      </button>

      <h2 className="text-2xl font-semibold">Sửa thông tin khách sạn</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-4 space-y-4 text-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              Link 3D Tour (Matterport iframe URL)
            </label>
            <input
              name="virtualTourUrl"
              value={form.virtualTourUrl}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="https://my.matterport.com/show/?m=...&play=1"
            />
            <p className="mt-1 text-xs text-gray-500">Dán URL nhúng (allow embed). Không cần thẻ iframe.</p>
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
              Giá gốc / đêm
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
          <div className="md:col-span-2">
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
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Ảnh đại diện (URL)
            </label>
            <input
              name="imageUrl"
              value={form.imageUrl}
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
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Ảnh hiện có
              </label>
              {existingImages.length === 0 ? (
                <p className="text-xs text-gray-500">Chưa có ảnh nào.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((url, index) => {
                    const isPrimary = url === form.imageUrl || index === 0;
                    return (
                      <div key={url} className="relative">
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryExistingImage(url)}
                          className={`focus:outline-none ${
                            isPrimary ? 'ring-2 ring-blue-500 rounded' : ''
                          }`}
                          title={
                            isPrimary
                              ? 'Ảnh đại diện (ảnh chính)'
                              : 'Bấm để đặt làm ảnh đại diện'
                          }
                        >
                          <img
                            src={url}
                            alt="Hotel"
                            className="w-16 h-16 rounded object-cover border"
                          />
                          {isPrimary && (
                            <span className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-[10px] text-white text-center rounded-b">
                              Ảnh đại diện
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(url)}
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                          title="Xóa ảnh này"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Thêm ảnh mới (có thể chọn nhiều ảnh)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleNewImagesChange}
                className="text-xs"
              />
              {newImagePreviews.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {newImagePreviews.map((src, index) => (
                    <div key={index} className="relative">
                      <img
                        src={src}
                        alt={`New preview ${index + 1}`}
                        className="w-16 h-16 rounded object-cover border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                        title="Bỏ ảnh này"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Danh sách phòng & giá</h3>
            <button
              type="button"
              onClick={handleAddRoom}
              className="px-3 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
            >
              + Thêm loại phòng
            </button>
          </div>

          {rooms.length === 0 ? (
            <p className="text-xs text-gray-500">Chưa có phòng nào, hãy thêm loại phòng mới.</p>
          ) : (
            <div className="space-y-2">
              {rooms.map((room, index) => (
                <div
                  key={room.id || index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border rounded p-2"
                >
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Tên phòng
                    </label>
                    <input
                      value={room.name}
                      onChange={(e) => handleRoomChange(index, 'name', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-xs"
                      placeholder="VD: Phòng Deluxe"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Giá / đêm
                    </label>
                    <input
                      type="number"
                      value={room.pricePerNight}
                      onChange={(e) => handleRoomChange(index, 'pricePerNight', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-xs"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Số khách tối đa
                    </label>
                    <input
                      type="number"
                      value={room.maxGuests}
                      onChange={(e) => handleRoomChange(index, 'maxGuests', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-xs"
                      min={1}
                    />
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">
                        Số phòng
                      </label>
                      <input
                        type="number"
                        value={room.totalRooms}
                        onChange={(e) => handleRoomChange(index, 'totalRooms', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-xs"
                        min={1}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRoom(index)}
                      className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs hover:bg-red-200 whitespace-nowrap"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminHotelEditPage;
