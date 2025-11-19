import React, { useEffect, useMemo, useState } from "react";
import { fetchInvoices, createInvoicesBatch } from "../lib/api.js"; // GET + POST

// Card nhỏ cho phần summary
function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-100">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">
        {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
      </div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

// Bảng invoice dùng chung
function InvoiceTable({ title, invoices }) {
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-100">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-gray-500">
          {invoices.length} giao dịch
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-2">Mã</th>
              <th className="px-4 py-2">Khách hàng</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Mô tả</th>
              <th className="px-4 py-2">Ngày đến hạn</th>
              <th className="px-4 py-2">Số tiền</th>
              <th className="px-4 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-4 text-center text-gray-400 italic"
                >
                  Không có giao dịch nào
                </td>
              </tr>
            )}
            {invoices.map((inv) => {
              const isOverdue = inv.isOverdue;
              return (
                <tr
                  key={inv._id || inv.id || inv.code}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 font-mono text-xs">
                    {inv.code || inv._id}
                  </td>
                  <td className="px-4 py-2">{inv.customer_name}</td>
                  <td className="px-4 py-2">
                    {/* ĐÃ CHUẨN HOÁ: luôn dùng customer_email */}
                    {inv.customer_email || "—"}
                  </td>
                  <td className="px-4 py-2 max-w-xs truncate">
                    {inv.description || "—"}
                  </td>
                  <td className="px-4 py-2">
                    {inv.due
                      ? inv.due.toLocaleDateString("vi-VN")
                      : inv.due_date
                      ? new Date(inv.due_date).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="px-4 py-2 font-semibold">
                    {inv.amount != null
                      ? inv.amount.toLocaleString("vi-VN") + " ₫"
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {inv.status === "PAID" ? (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700">
                        Đã thanh toán
                      </span>
                    ) : isOverdue ? (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-50 text-red-600">
                        Quá hạn
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700">
                        Chưa thanh toán
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function InvoicesDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  // state cho form tạo invoice mới
  const [form, setForm] = useState({
    code: "",
    customer_name: "",
    customer_email: "",
    description: "",
    due_date: "",
    amount: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // lấy data từ API
  useEffect(() => {
    async function load() {
      try {
        const res = await fetchInvoices(); // { invoices: [...] } từ GET /api/invoices
        setInvoices(res.invoices || []);
      } catch (err) {
        console.error("API error:", err);
        setError("Không lấy được dữ liệu invoice từ server");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const now = new Date();

  // Chuẩn hoá data từ backend (Mongo/Mongoose)
  const enrichedInvoices = useMemo(() => {
    return invoices.map((raw) => {
      const status = (raw.status || "PENDING").toUpperCase();
      const due = raw.due_date ? new Date(raw.due_date) : null;
      const paid = raw.paid_date ? new Date(raw.paid_date) : null;
      const isPaid = status === "PAID";
      const isOverdue = !isPaid && due && due < now;

      // 🔹 CHUẨN HOÁ EMAIL: gom về 1 field customer_email
      const customer_email =
        raw.customer_email || raw.email_customer || raw.email || "";

      return {
        ...raw,
        status,
        due,
        paid,
        isPaid,
        isOverdue,
        customer_email,
      };
    });
  }, [invoices, now]);

  const customers = useMemo(() => {
    return [
      ...new Set(enrichedInvoices.map((i) => i.customer_name).filter(Boolean)),
    ];
  }, [enrichedInvoices]);

  const filteredInvoices = useMemo(() => {
    return enrichedInvoices.filter((inv) => {
      const matchCustomer = customerFilter
        ? inv.customer_name === customerFilter
        : true;

      const text = (
        (inv.customer_name || "") +
        " " +
        (inv.customer_email || "") +
        " " +
        (inv.description || "") +
        " " +
        (inv.code || inv._id || inv.id || "")
      ).toLowerCase();

      const matchSearch = search ? text.includes(search.toLowerCase()) : true;

      return matchCustomer && matchSearch;
    });
  }, [enrichedInvoices, customerFilter, search]);

  const unpaidInvoices = useMemo(
    () => filteredInvoices.filter((inv) => !inv.isPaid),
    [filteredInvoices]
  );

  const paidInvoices = useMemo(
    () => filteredInvoices.filter((inv) => inv.isPaid),
    [filteredInvoices]
  );

  const overdueInvoices = useMemo(
    () => unpaidInvoices.filter((inv) => inv.isOverdue),
    [unpaidInvoices]
  );

  // cashflow prediction: dự kiến thu trong 7 & 30 ngày tới từ các invoice chưa thanh toán
  const prediction = useMemo(() => {
    const in7 = new Date(now);
    in7.setDate(in7.getDate() + 7);
    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);

    let next7 = 0;
    let next30 = 0;

    for (const inv of unpaidInvoices) {
      if (!inv.due) continue;
      if (inv.due > now && inv.due <= in7) {
        next7 += inv.amount || 0;
      }
      if (inv.due > now && inv.due <= in30) {
        next30 += inv.amount || 0;
      }
    }
    return { next7, next30 };
  }, [unpaidInvoices, now]);

  const totalUnpaid = useMemo(
    () => unpaidInvoices.reduce((s, i) => s + (i.amount || 0), 0),
    [unpaidInvoices]
  );
  const totalPaid = useMemo(
    () => paidInvoices.reduce((s, i) => s + (i.amount || 0), 0),
    [paidInvoices]
  );
  const totalOverdue = useMemo(
    () => overdueInvoices.reduce((s, i) => s + (i.amount || 0), 0),
    [overdueInvoices]
  );

  // handle change form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // submit form -> POST /api/invoices/batch
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !form.code ||
      !form.customer_name ||
      !form.customer_email ||
      !form.due_date ||
      !form.amount
    ) {
      setFormError(
        "Vui lòng nhập đầy đủ Mã, Khách hàng, Email, Ngày đến hạn và Số tiền."
      );
      return;
    }

    const newInvoice = {
      code: form.code.trim(),
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim(),
      description: form.description.trim(),
      due_date: form.due_date, // input type="date" => "YYYY-MM-DD"
      amount: Number(form.amount) || 0,
      // status mặc định PENDING ở backend
    };

    setSaving(true);
    try {
      const res = await createInvoicesBatch([newInvoice]);
      const inserted = res.invoices || [];
      // thêm vào danh sách hiện tại để update UI luôn
      setInvoices((prev) => [...prev, ...inserted]);

      // reset form
      setForm({
        code: "",
        customer_name: "",
        customer_email: "",
        description: "",
        due_date: "",
        amount: "",
      });
    } catch (err) {
      console.error("Create invoice error:", err);
      setFormError("Tạo giao dịch thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="">
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* FORM TẠO GIAO DỊCH */}
        <section className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h2 className="text-lg font-semibold">Tạo giao dịch mới</h2>
          <form
            className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
            onSubmit={handleCreateInvoice}
          >
            <div>
              <label className="block text-xs text-gray-500 mb-1">Mã</label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                placeholder="INV001"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Khách hàng
              </label>
              <input
                type="text"
                name="customer_name"
                value={form.customer_name}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                placeholder="Công ty ABC"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Email khách hàng
              </label>
              <input
                type="email"
                name="customer_email"
                value={form.customer_email}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                placeholder="Thanh toán dịch vụ ..."
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Ngày đến hạn
              </label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Số tiền
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                placeholder="1000000"
                min="0"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="md:col-span-6 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Đang tạo..." : "Tạo giao dịch"}
            </button>
          </form>
          {formError && (
            <p className="text-xs text-red-600 mt-1">{formError}</p>
          )}
        </section>

        {/* SUMMARY */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Tổng chưa thanh toán"
            value={totalUnpaid}
            sub={`${unpaidInvoices.length} hóa đơn`}
          />
          <StatCard
            label="Tổng đã thanh toán"
            value={totalPaid}
            sub={`${paidInvoices.length} hóa đơn`}
          />
          <StatCard
            label="Quá hạn"
            value={totalOverdue}
            sub={`${overdueInvoices.length} hóa đơn quá hạn`}
          />
          <StatCard
            label="Dự kiến thu (7 ngày / 30 ngày)"
            value={`${prediction.next7.toLocaleString(
              "vi-VN"
            )} / ${prediction.next30.toLocaleString("vi-VN")} ₫`}
            sub="Từ các invoice chưa thanh toán"
          />
        </section>

        {/* FILTERS */}
        <section className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Khách hàng
              </label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                {customers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full md:w-64">
            <label className="block text-xs text-gray-500 mb-1">Tìm kiếm</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              placeholder="Mã, khách hàng, email, mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </section>

        {/* OVERDUE REMINDERS */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Overdue reminders
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-red-50 text-red-600">
              {overdueInvoices.length} hóa đơn cần nhắc nhở
            </span>
          </h2>
          <p className="text-sm text-gray-500">
            Đây là danh sách các hóa đơn quá hạn, bạn có thể dùng để gửi email /
            SMS nhắc khách hàng (xử lý logic phía backend).
          </p>
          <InvoiceTable
            title="Hóa đơn quá hạn"
            invoices={[...overdueInvoices].sort(
              (a, b) => (a.due?.getTime() || 0) - (b.due?.getTime() || 0)
            )}
          />
        </section>

        {/* TWO TABLES: UNPAID & PAID */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InvoiceTable
            title="Giao dịch chưa thanh toán"
            invoices={[...unpaidInvoices]
              .filter((i) => !i.isOverdue)
              .sort(
                (a, b) => (a.due?.getTime() || 0) - (b.due?.getTime() || 0)
              )}
          />
          <InvoiceTable
            title="Giao dịch đã thanh toán"
            invoices={[...paidInvoices].sort(
              (a, b) => (b.paid?.getTime() || 0) - (a.paid?.getTime() || 0)
            )}
          />
        </section>
      </main>
    </div>
  );
}
