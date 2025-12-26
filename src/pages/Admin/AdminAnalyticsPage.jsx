import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { get } from '../../services/api';

const actionLabels = {
  login: 'Đăng nhập',
  view_hotel: 'Xem chi tiết khách sạn',
  book_trip: 'Đặt chuyến đi'
};

const AdminAnalyticsPage = () => {
  const [summary, setSummary] = useState({
    login: 0,
    view_hotel: 0,
    book_trip: 0
  });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await get('/analytics/stats');
        setSummary(data.summary || {});
        setRecent(data.recent || []);
      } catch (e) {
        // lỗi đã được toast ở api layer
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const chartData = [
    { type: 'Đăng nhập', key: 'login', value: summary.login || 0, color: '#3b82f6' },
    { type: 'Xem chi tiết', key: 'view_hotel', value: summary.view_hotel || 0, color: '#10b981' },
    { type: 'Đặt chuyến', key: 'book_trip', value: summary.book_trip || 0, color: '#f97316' }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Phân tích hành vi người dùng</h2>

      <p className="text-sm text-gray-600">
        Thống kê các hành vi chính của người dùng: đăng nhập, xem chi tiết khách sạn
        và đặt chuyến đi.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 space-y-3 lg:col-span-2">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Biểu đồ tổng quan</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="type"
                    tick={{ fontSize: 11 }}
                    tickMargin={8}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [`${value} lượt`, 'Số lần']}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <cell
                        // eslint-disable-next-line react/no-array-index-key
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4 space-y-2 text-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Tổng quan nhanh</h3>
          <ul className="space-y-1 text-xs text-gray-700">
            <li className="flex justify-between">
              <span>Đăng nhập</span>
              <span className="font-semibold text-blue-600">{summary.login || 0}</span>
            </li>
            <li className="flex justify-between">
              <span>Xem chi tiết khách sạn</span>
              <span className="font-semibold text-emerald-600">{summary.view_hotel || 0}</span>
            </li>
            <li className="flex justify-between">
              <span>Đặt chuyến đi</span>
              <span className="font-semibold text-orange-600">{summary.book_trip || 0}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 text-sm">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Bảng hành vi gần đây</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có dữ liệu hành vi nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2">Người dùng</th>
                  <th className="px-3 py-2">Hành vi</th>
                  <th className="px-3 py-2">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-3 py-2">
                      {item.user ? (
                        <>
                          <div className="font-medium text-gray-800">{item.user.fullName || item.user.email}</div>
                          <div className="text-[11px] text-gray-500">{item.user.email}</div>
                        </>
                      ) : (
                        <span className="text-gray-500">(Ẩn danh)</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate-700">
                        {actionLabels[item.actionType] || item.actionType}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-gray-600">
                      {new Date(item.timestamp).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
