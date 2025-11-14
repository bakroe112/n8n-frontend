import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'

export default function CashflowChart({ data = [], month, year, onChangeMonth, onChangeYear }) {
  const fmt = new Intl.NumberFormat('vi-VN')

  const filteredData = useMemo(() => {
    const m = Number(month)
    const y = Number(year)
    return data.filter(d => {
      const date = new Date(String(d.date).replace(" ", "T"))
      const mm = date.getMonth() + 1
      const yy = date.getFullYear()
      const monthOk = month ? mm === m : true
      const yearOk = year ? yy === y : true
      return monthOk && yearOk
    })
  }, [data, month, year])

  return (
    <div className="rounded-2xl bg-white shadow p-5">
      <div className="font-semibold text-gray-800 mb-2">
        Tiền vào / Tiền ra / Dòng tiền ròng theo ngân hàng tháng {month} năm {year}
      </div>

      <div className="flex gap-2 mb-3">
        <select 
          value={month} 
          onChange={(e)=>onChangeMonth(e.target.value)} 
          className="border rounded px-2 py-1 text-sm w-28"
        >
          {[...Array(12)].map((_,i)=>(
            <option key={i+1} value={i+1}>Tháng {i+1}</option>
          ))}
        </select>

        <select 
          value={year} 
          onChange={(e)=>onChangeYear(e.target.value)} 
          className="border rounded px-2 py-1 text-sm w-32"
        >
          {[2023,2024,2025,2026].map(y=>(
            <option key={y} value={y}>Năm {y}</option>
          ))}
        </select>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bank_name" />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v)=>fmt.format(v)} />
            <Tooltip formatter={(v)=>fmt.format(v)} />
            <Legend />
            <Line type="monotone" dataKey="total_credit" name="Tiền vào" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="total_debit" name="Tiền ra" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="net_cashflow" name="Dòng tiền ròng" stroke="#0ea5e9" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
