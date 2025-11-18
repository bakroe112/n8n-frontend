import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

const parseDate = (value) => {
  if (!value) return null;
  const s = String(value).replace("Z", "");
  return new Date(s);
};

const formatDate = (value) => {
  if (!value) return "";

  // Không chơi Date + timezone nữa, format thẳng từ string
  const s = String(value)
    .replace("Z", "") // bỏ Z
    .slice(0, 19) // lấy tới giây: 2025-11-17T22:56:05
    .replace("T", " "); // -> 2025-11-17 22:56:05

  return s;
};
export default function TransactionsTable({ rows }) {
  const fmt = Intl.NumberFormat("vi-VN");

  // state lọc theo tháng / năm
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // NEW: lọc theo loại tiền & khoảng thời gian
  // cashFilter: all | in | out
  const [cashFilter, setCashFilter] = useState("all");
  // rangeFilter: all | today | week | month
  const [rangeFilter, setRangeFilter] = useState("all");

  // danh sách năm có trong dữ liệu
  const years = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      const d = parseDate(r.date);
      if (d && !isNaN(d.getTime())) {
        set.add(d.getFullYear());
      }
    });
    return Array.from(set).sort((a, b) => b - a); // năm mới -> cũ
  }, [rows]);

  const filteredRows = useMemo(() => {
    const m = selectedMonth ? Number(selectedMonth) : null;
    const y = selectedYear ? Number(selectedYear) : null;

    const now = new Date();

    const isToday = (d) =>
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    const isThisWeek = (d) => {
      const current = new Date(now);
      const day = current.getDay(); // 0 = Sun ... 6 = Sat
      // Lấy thứ 2 làm đầu tuần
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(current);
      monday.setDate(current.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      return d >= monday && d <= sunday;
    };

    const isThisMonth = (d) =>
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();

    return rows.filter((r) => {
      const d = parseDate(r.date);
      if (!d || isNaN(d.getTime())) return false;

      // filter tháng / năm (GIỮ NGUYÊN)
      const monthOk = m ? d.getMonth() + 1 === m : true;
      const yearOk = y ? d.getFullYear() === y : true;

      // filter khoảng thời gian mới
      let timeOk = true;
      if (rangeFilter === "today") timeOk = isToday(d);
      else if (rangeFilter === "week") timeOk = isThisWeek(d);
      else if (rangeFilter === "month") timeOk = isThisMonth(d);

      // filter loại tiền mới
      let typeOk = true;
      if (cashFilter === "in") typeOk = r.type === "credit";
      else if (cashFilter === "out") typeOk = r.type !== "credit";

      return monthOk && yearOk && timeOk && typeOk;
    });
  }, [rows, selectedMonth, selectedYear, cashFilter, rangeFilter]);

  // Dữ liệu cho chart: gom theo ngày, tính tổng cash-in / cash-out
  const chartData = useMemo(() => {
    const map = new Map();

    filteredRows.forEach((r) => {
      const d = parseDate(r.date);
      if (!d || isNaN(d.getTime())) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;

      if (!map.has(key)) {
        map.set(key, { date: key, cashIn: 0, cashOut: 0 });
      }

      const entry = map.get(key);
      const amt = Number(r.amount) || 0;

      if (r.type === "credit") entry.cashIn += amt;
      else entry.cashOut += amt;
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [filteredRows]);

  return (
    <div className="rounded-2xl bg-white shadow p-5 overflow-hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="font-semibold text-gray-800">Giao dịch gần đây</div>

        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span>Tổng: {filteredRows.length}</span>

          {/* Tháng */}
          <div className="flex items-center gap-1">
            <span>Tháng:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-md h-8 text-xs bg-white"
            >
              <option value="">Tất cả</option>
              {Array.from({ length: 12 }).map((_, i) => {
                const monthValue = String(i + 1);
                return (
                  <option key={monthValue} value={monthValue}>
                    {monthValue.padStart(2, "0")}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Năm */}
          <div className="flex items-center gap-1">
            <span>Năm:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border rounded-md  h-8 text-xs bg-white"
            >
              <option value="">Tất cả</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* NEW: Loại tiền */}
          <div className="flex items-center gap-1">
            <span>Loại:</span>
            <select
              value={cashFilter}
              onChange={(e) => setCashFilter(e.target.value)}
              className="border rounded-md px-2 h-8 text-xs bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="in">Cash-in</option>
              <option value="out">Cash-out</option>
            </select>
          </div>

          {/* NEW: Khoảng thời gian */}
          <div className="flex items-center gap-1">
            <span>Khoảng:</span>
            <select
              value={rangeFilter}
              onChange={(e) => setRangeFilter(e.target.value)}
              className="border rounded-md px-2 h-8 text-xs bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mini chart Cash-in / Cash-out */}
      {chartData.length > 0 && (
        <div className="mt-4 h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value) => `${fmt.format(value)}₫`}
                labelFormatter={(label) => `Ngày ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cashIn"
                name="Cash-in"
                stroke="#22c55e"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cashOut"
                name="Cash-out"
                stroke="#ef4444"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-3 max-h-[500px] overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Ngày</th>
              <th className="py-2 pr-4">Ngân hàng</th>
              <th className="py-2 pr-4">Mô tả</th>
              <th className="py-2 pr-4">Loại</th>
              <th className="py-2 pr-4">Số tiền</th>
              <th className="py-2 pr-4">Số dư hiện tại</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2 pr-4">{formatDate(r.date)}</td>
                <td className="py-2 pr-4">{r.bank_name}</td>
                <td className="py-2 pr-4">{r.description}</td>
                <td className="py-2 pr-4">
                  <span
                    className={
                      "px-2 py-1 rounded-full text-xs " +
                      (r.type === "credit"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700")
                    }
                  >
                    {r.type}
                  </span>
                </td>
                <td className="py-2 pr-4">{fmt.format(r.amount)}₫</td>
                <td className="py-2 pr-4">{fmt.format(r.balance)}₫</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
