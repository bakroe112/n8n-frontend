import React from 'react'

const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  // Chuẩn hoá sang Asia/Ho_Chi_Minh
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  })
    .formatToParts(d)
    .reduce((acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value
      return acc
    }, {})

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}-${parts.minute}-${parts.second}`
}

export default function TransactionsTable({ rows }) {
  const fmt = Intl.NumberFormat('vi-VN')
  return (
    <div className="rounded-2xl bg-white shadow p-5 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-gray-800">Giao dịch gần đây</div>
        <div className="text-xs text-gray-500">Tổng: {rows.length}</div>
      </div>
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
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2 pr-4">{formatDate(r.date)}</td>
                <td className="py-2 pr-4">{r.bank_name}</td>
                <td className="py-2 pr-4">{r.description}</td>
                <td className="py-2 pr-4">
                  <span className={"px-2 py-1 rounded-full text-xs " + (r.type === "credit" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                    {r.type}
                  </span>
                </td>
                <td className="py-2 pr-4">{fmt.format(r.amount)}₫</td>
                <td className="py-2 pr-4">{fmt.format(r.balance_after)}₫</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
