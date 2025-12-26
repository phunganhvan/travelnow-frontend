import React, { useEffect, useState } from 'react';
import { del, get, post, put } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'user'
};

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    role: 'user',
    isActive: true,
    password: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    avatarUrl: '',
    avatarDataUrl: ''
  });

  const visibleUsers = currentUser?.role === 'superadmin'
    ? users
    : users.filter((u) => u.role !== 'superadmin');

  const customerUsers = visibleUsers.filter((u) => u.role === 'user');
  const staffUsers = visibleUsers.filter((u) => u.role !== 'user');

  const fetchUsers = () => {
    setLoading(true);
    get('/admin/users')
      .then((data) => {
        setUsers(data.users || []);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Không tải được danh sách người dùng');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    post('/admin/users', form)
      .then(() => {
        setForm(initialForm);
        fetchUsers();
      })
      .catch((err) => {
        setError(err.message || 'Không tạo được tài khoản');
      })
      .finally(() => setSubmitting(false));
  };

  const handleMakeAdmin = (id) => {
    put(`/admin/users/${id}`, { role: 'admin' })
      .then(fetchUsers)
      .catch(() => {});
  };

  const handleToggleActive = (user) => {
    if (user.role === 'superadmin' && currentUser?.role !== 'superadmin') {
      toast.error('Chỉ Super Admin mới được phép thay đổi trạng thái của tài khoản Super Admin');
      return;
    }

    const nextActive = !user.isActive;
    put(`/admin/users/${user._id}`, { isActive: nextActive })
      .then(() => {
        toast.success(nextActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
        fetchUsers();
      })
      .catch(() => {});
  };

  const handleDelete = (id) => {
    const target = users.find((u) => u._id === id);
    if (target && target.role === 'superadmin' && currentUser?.role !== 'superadmin') {
      toast.error('Chỉ Super Admin mới được phép xóa tài khoản Super Admin');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    del(`/admin/users/${id}`)
      .then(fetchUsers)
      .catch(() => {});
  };

  const handleSelectUser = (u) => {
    if (u.role === 'superadmin' && currentUser?.role !== 'superadmin') {
      toast.error('Bạn không có quyền xem chi tiết tài khoản Super Admin');
      return;
    }

    setSelectedUser(u);
    setEditForm({
      fullName: u.fullName || '',
      email: u.email || '',
      role: u.role || 'user',
      isActive: u.isActive ?? true,
      password: '',
      phone: u.phone || '',
      address: u.address || '',
      dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : '',
      avatarUrl: u.avatarUrl || ''
    });
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm((prev) => ({
        ...prev,
        avatarDataUrl: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const isEditingSelf =
    selectedUser && currentUser &&
    (selectedUser._id === currentUser.id || selectedUser._id === currentUser._id);

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const payload = {
      fullName: editForm.fullName,
      email: editForm.email,
      role: editForm.role,
      isActive: editForm.isActive,
      phone: editForm.phone,
      address: editForm.address,
      dateOfBirth: editForm.dateOfBirth,
      avatarUrl: editForm.avatarUrl
    };

    if (editForm.password) {
      payload.password = editForm.password;
    }

    if (editForm.avatarDataUrl) {
      payload.avatarDataUrl = editForm.avatarDataUrl;
    }

    put(`/admin/users/${selectedUser._id}`, payload)
      .then(() => {
        toast.success('Cập nhật tài khoản thành công');
        setEditForm((prev) => ({ ...prev, password: '', avatarDataUrl: '' }));
        fetchUsers();
      })
      .catch((err) => {
        setError(err.message || 'Không cập nhật được tài khoản');
      });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Quản lý người dùng</h2>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-lg shadow p-4 space-y-3 text-sm"
      >
        <h3 className="font-medium">Tạo tài khoản mới (bao gồm admin)</h3>
        <p className="text-xs text-gray-500 mt-1">
          Email phải đúng định dạng hợp lệ.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Họ tên
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Vai trò
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="user">User</option>
              <option value="staff">Nhân viên</option>
              <option value="manager">Quản lý</option>
              <option value="admin">Admin</option>
              {currentUser?.role === 'superadmin' && (
                <option value="superadmin">Super Admin</option>
              )}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
        >
          {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
        </button>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </form>

      {error && (
        <div className="text-xs text-red-500">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow p-4 text-sm">
        <h3 className="font-medium mb-3">Tài khoản khách hàng (User)</h3>
        {loading ? (
          <p className="text-gray-500 text-sm">Đang tải...</p>
        ) : customerUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có tài khoản khách hàng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2">Họ tên</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Vai trò</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {customerUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="border-t cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSelectUser(u)}
                  >
                    <td className="px-3 py-2">{u.fullName}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(u)}
                        className={`text-xs px-2 py-0.5 rounded ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                      >
                        {u.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right space-x-2">
                      {u.role !== 'admin' && u.role !== 'superadmin' && (
                        <button
                          type="button"
                          onClick={() => handleMakeAdmin(u._id)}
                          className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                        >
                          Cấp quyền admin
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(u._id)}
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

      <div className="bg-white rounded-lg shadow p-4 text-sm">
        <h3 className="font-medium mb-3">Tài khoản nhân viên / quản trị</h3>
        {loading ? (
          <p className="text-gray-500 text-sm">Đang tải...</p>
        ) : staffUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có tài khoản nhân viên nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2">Họ tên</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Vai trò</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {staffUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="border-t cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSelectUser(u)}
                  >
                    <td className="px-3 py-2">{u.fullName}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(u)}
                        className={`text-xs px-2 py-0.5 rounded ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                      >
                        {u.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right space-x-2">
                      {u.role !== 'admin' && u.role !== 'superadmin' && (
                        <button
                          type="button"
                          onClick={() => handleMakeAdmin(u._id)}
                          className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                        >
                          Cấp quyền admin
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(u._id)}
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

      {selectedUser && (
        <form
          onSubmit={handleUpdate}
          className="bg-white rounded-lg shadow p-4 space-y-3 text-sm"
        >
          <h3 className="font-medium">
            Chi tiết tài khoản: {selectedUser.fullName || selectedUser.email}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Họ tên
              </label>
              <input
                name="fullName"
                value={editForm.fullName}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Vai trò
              </label>
              <select
                name="role"
                value={editForm.role}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                <option value="user">User</option>
                <option value="staff">Nhân viên</option>
                <option value="manager">Quản lý</option>
                <option value="admin">Admin</option>
                {currentUser?.role === 'superadmin' && (
                  <option value="superadmin">Super Admin</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Số điện thoại
              </label>
              <input
                name="phone"
                value={editForm.phone || ''}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Ngày sinh
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={editForm.dateOfBirth || ''}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm"
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
                value={editForm.address || ''}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Ảnh đại diện (URL)
              </label>
              <input
                name="avatarUrl"
                value={editForm.avatarUrl || ''}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tải ảnh đại diện
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="w-full text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div className="flex items-center gap-2">
              <input
                id="editIsActive"
                type="checkbox"
                name="isActive"
                checked={editForm.isActive}
                onChange={handleEditChange}
              />
              <label
                htmlFor="editIsActive"
                className="text-xs font-medium text-gray-600"
              >
                Đang hoạt động
              </label>
            </div>
            {(currentUser?.role === 'superadmin' || currentUser?.role === 'admin') && !isEditingSelf && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Mật khẩu mới (tùy chọn)
                </label>
                <input
                  type="password"
                  name="password"
                  value={editForm.password}
                  onChange={handleEditChange}
                  className="w-full border rounded px-2 py-1 text-sm"
                  minLength={6}
                />
              </div>
            )}
          </div>
          <div className="mt-2">
            {(editForm.avatarDataUrl || editForm.avatarUrl) && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600">Xem trước ảnh đại diện:</span>
                <img
                  src={editForm.avatarDataUrl || editForm.avatarUrl}
                  alt="Avatar preview"
                  className="w-12 h-12 rounded-full object-cover border"
                />
              </div>
            )}
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

export default AdminUsersPage;
