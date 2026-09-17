import React, { useEffect, useState } from 'react';
import { Search, Filter, CheckCircle2, XCircle, Clock, Eye, AlertCircle } from 'lucide-react';
import { adminApi } from '../api/client';
import { BillReviewModal } from '../components/BillReviewModal';

export const BillsPage: React.FC = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [months, setMonths] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Review Modal State
  const [selectedBill, setSelectedBill] = useState<any | null>(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchBills();

    // Tự động cập nhật hóa đơn mới nộp mỗi 3 giây
    const interval = setInterval(() => {
      fetchBills(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [page, statusFilter, monthFilter, activityFilter]);

  const fetchMetadata = async () => {
    try {
      const [mRes, aRes] = await Promise.all([
        adminApi.listMonths(),
        adminApi.listActivities(),
      ]);
      if (mRes.data) setMonths(mRes.data);
      if (aRes.data) setActivities(aRes.data);
    } catch (err) {
      console.error('Lỗi tải metadata filter:', err);
    }
  };

  const fetchBills = async (showLoadingSpinner: boolean = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const res = await adminApi.getBills({
        page,
        limit: 15,
        status: statusFilter,
        monthId: monthFilter,
        activityId: activityFilter,
        search: searchTerm,
      });

      if (res.data) {
        setBills(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bill:', err);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBills();
  };

  // Nút duyệt nhanh
  const handleQuickApprove = async (e: React.MouseEvent, bill: any) => {
    e.stopPropagation();
    try {
      await adminApi.approveBill(bill.id, 'Đã duyệt hợp lệ');
      fetchBills();
    } catch (err: any) {
      alert(err.message || 'Lỗi duyệt hóa đơn');
    }
  };

  // Nút từ chối nhanh
  const handleQuickReject = async (e: React.MouseEvent, bill: any) => {
    e.stopPropagation();
    setSelectedBill(bill); // Mở modal để nhập lý do từ chối
  };

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
      : '';
    return `${baseUrl}${imagePath}`;
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Quản Lý & Phê Duyệt Hóa Đơn</h1>
          <p className="text-xs text-gray-500">
            Tìm thấy tổng cộng <strong>{totalCount}</strong> lượt gửi hóa đơn
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-1 bg-gray-200/80 p-1 rounded-2xl">
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'pending', label: 'Chờ Duyệt' },
            { id: 'approved', label: 'Đã Duyệt' },
            { id: 'rejected', label: 'Từ Chối' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Form Search SĐT hoặc Tên */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo SĐT hoặc Tên khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-aeon-primary"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Lọc theo Tháng */}
          <select
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none"
          >
            <option value="all">Tất Cả Tháng</option>
            {months.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Lọc theo Activity */}
          <select
            value={activityFilter}
            onChange={(e) => {
              setActivityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none max-w-[200px] truncate"
          >
            <option value="all">Tất Cả Hoạt Động</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => fetchBills()}
            className="px-4 py-2 bg-aeon-primary text-white font-bold text-xs rounded-xl shadow-sm hover:bg-aeon-dark transition-colors"
          >
            Lọc
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/80 border-b border-gray-200/80 uppercase text-[10px] font-extrabold text-gray-500">
              <tr>
                <th className="py-3.5 px-4">STT</th>
                <th className="py-3.5 px-4">Thời Gian</th>
                <th className="py-3.5 px-4">Khách Hàng (Tên / SĐT)</th>
                <th className="py-3.5 px-4">Tháng</th>
                <th className="py-3.5 px-4">Hoạt Động</th>
                <th className="py-3.5 px-4 text-center">Ảnh Bill</th>
                <th className="py-3.5 px-4 text-center">Phê Duyệt</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-aeon-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Đang tải dữ liệu hóa đơn...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Không tìm thấy hóa đơn nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                bills.map((bill, index) => {
                  const itemIndex = (page - 1) * 15 + index + 1;
                  const timeStr = new Date(bill.submittedAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const dateStr = new Date(bill.submittedAt).toLocaleDateString('vi-VN');

                  return (
                    <tr
                      key={bill.id}
                      onClick={() => setSelectedBill(bill)}
                      className="hover:bg-rose-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 text-gray-500">{itemIndex}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900 block">{timeStr}</span>
                        <span className="text-[11px] text-gray-400">{dateStr}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block">
                          {bill.customer?.name || 'Chưa đặt tên'}
                        </span>
                        <span className="font-mono text-aeon-primary text-[11px]">
                          {bill.customer?.phone}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-800">
                        {bill.month?.name}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-800 max-w-[200px] truncate">
                        {bill.activity?.name}
                      </td>

                      {/* Thumbnail ảnh bill */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden mx-auto border border-gray-200">
                          <img
                            src={getFullImageUrl(bill.billImage)}
                            alt="Bill thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Trạng thái duyệt */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 text-[11px] font-black rounded-full uppercase ${
                            bill.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : bill.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {bill.status === 'approved'
                            ? 'ĐÃ DUYỆT'
                            : bill.status === 'rejected'
                            ? 'TỪ CHỐI'
                            : 'CHỜ DUYỆT'}
                        </span>
                      </td>

                      {/* Nút hành động */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {bill.status === 'pending' ? (
                            <>
                              <button
                                onClick={(e) => handleQuickApprove(e, bill)}
                                title="Chấp nhận nhanh"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleQuickReject(e, bill)}
                                title="Từ chối nhanh"
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedBill(bill)}
                              title="Xem chi tiết"
                              className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang Pagination */}
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

      {/* Modal Soi Bill Chi Tiết */}
      {selectedBill && (
        <BillReviewModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
          onActionComplete={() => fetchBills()}
        />
      )}
    </div>
  );
};
