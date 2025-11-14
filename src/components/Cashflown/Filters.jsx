import React from 'react'

export default function Filters({ banks, selectedBank, setSelectedBank, search, setSearch }) {
  return (
    <div className="rounded-2xl bg-white shadow p-5 flex flex-col md:flex-row gap-3 md:items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">Ngân hàng</label>
        <select
          value={selectedBank}
          onChange={e => setSelectedBank(e.target.value)}
          className="mt-1 block w-full rounded-lg border-gray-300 focus:border-sky-500 focus:ring-sky-500"
        >
          <option value="">Tất cả</option>
          {banks.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">Tìm mô tả</label>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ví dụ: Thu, Chi, vận chuyển..."
          className="mt-1 block w-full rounded-lg border-gray-300 focus:border-sky-500 focus:ring-sky-500"
        />
      </div>
    </div>
  )
}
