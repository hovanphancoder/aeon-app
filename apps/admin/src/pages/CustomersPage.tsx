import React, { useEffect, useState } from 'react';
import { Users, Search, Phone, Calendar, Receipt } from 'lucide-react';
import { adminApi } from '../api/client';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.listCustomers({ page, limit: 15, search });
      if (res.data) {
        setCustomers(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Lỗi tải khách hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Danh Sách Khách Hàng</h1>
          <p className="text-xs text-gray-500">
            Tổng cộng <strong>{totalCount}</strong> khách hàng đã tham gia quét mã và xác thực
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo SĐT hoặc Tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-aeon-primary"
          />
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50/80 border-b border-gray-200/80 uppercase text-[10px] font-extrabold text-gray-500">
            <tr>
              <th className="py-3.5 px-4">STT</th>
              <th className="py-3.5 px-4">Họ Và Tên</th>
              <th className="py-3.5 px-4">Số Điện Thoại</th>
              <th className="py-3.5 px-4">Ngày Tham Gia Đầu Tiên</th>
              <th className="py-3.5 px-4 text-center">Tổng Lượt Nộp Bill</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  Đang tải danh sách khách hàng...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  Chưa có dữ liệu khách hàng.
                </td>
              </tr>
            ) : (
              customers.map((c, idx) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 text-gray-500">
                    {(page - 1) * 15 + idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{c.name}</td>
                  <td className="py-3.5 px-4 font-mono text-aeon-primary font-bold">
                    {c.phone}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-3 py-1 bg-rose-50 text-aeon-primary font-bold rounded-full">
                      {c._count?.billSubmissions || 0} lượt
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <span>
              Trang {page} / {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                Trang Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                Trang Tiếp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
