import React, { useEffect, useState, useMemo, Suspense, lazy } from "react";
import TransactionsTable from "../components/Cashflown/TransactionsTable.jsx";
import Filters from "../components/Cashflown/Filters.jsx";
import { fetchSummary, fetchTransactions } from "../lib/api.js";
import SummaryCards from "../components/Cashflown/SummaryCards.jsx";
const CashflowChart = lazy(() => import("../components/Cashflown/CashflowChart.jsx"));
export default function DashboardCashflow() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1)); // "1".."12"
  const [year, setYear] = useState(String(now.getFullYear())); // "2025"

  useEffect(() => {
    async function loadData() {
      try {
        const [s, t] = await Promise.all([fetchSummary(), fetchTransactions()]);
        setSummary(s.summaries);
        setTransactions(t.transactions);
      } catch (err) {
        console.error("API error:", err);
        setError("Không lấy được dữ liệu từ server");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  console.log("summary", summary);

  const banks = useMemo(
    () => [...new Set(transactions.map((t) => t.bank_name))],
    [transactions]
  );

  // tiện parse "YYYY-MM-DD" hoặc "YYYY-MM-DD HH:mm:ss"
  const toDate = (s) => new Date(String(s).replace(" ", "T"));

  // NEW: lọc summary theo month/year đang chọn
  const filteredSummary = useMemo(() => {
    if (!summary) return [];
    const m = Number(month);
    const y = Number(year);
    return summary.filter((d) => {
      const dt = toDate(d.date);
      return (
        (!month || dt.getMonth() + 1 === m) && (!year || dt.getFullYear() === y)
      );
    });
  }, [summary, month, year]);

  // tính totals từ summary đã lọc
  const totals = useMemo(() => {
    if (!filteredSummary?.length) return { totalIn: 0, totalOut: 0, net: 0 };
    return filteredSummary.reduce(
      (acc, s) => {
        acc.totalIn += s.total_credit || 0;
        acc.totalOut += s.total_debit || 0;
        acc.net += s.net_cashflow || 0;
        return acc;
      },
      { totalIn: 0, totalOut: 0, net: 0 }
    );
  }, [filteredSummary]);

  const filtered = useMemo(() => {
    const toDateTx = (s) => new Date(s.replace(" ", "T"));
    return transactions
      .filter((t) => {
        const bankOk = selectedBank ? t.bank_name === selectedBank : true;
        const searchOk = search
          ? t.description?.toLowerCase().includes(search.toLowerCase())
          : true;
        return bankOk && searchOk;
      })
      .slice()
      .sort((a, b) => Number(toDateTx(b.date)) - Number(toDateTx(a.date)));
  }, [transactions, selectedBank, search]);

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="">
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {summary && (
          <SummaryCards
            totalIn={totals.totalIn}
            totalOut={totals.totalOut}
            net={totals.net}
            label={`Tháng ${month}/${year}`}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <Suspense fallback={<div className="p-5">Đang tải biểu đồ...</div>}>
              <CashflowChart
                data={summary}
                month={month}
                year={year}
                onChangeMonth={setMonth}
                onChangeYear={setYear}
              />
            </Suspense>
          </div>
        </div>

        <Filters
          banks={banks}
          selectedBank={selectedBank}
          setSelectedBank={setSelectedBank}
          search={search}
          setSearch={setSearch}
        />
        <TransactionsTable rows={filtered} />
      </main>

    </div>
  );
}
