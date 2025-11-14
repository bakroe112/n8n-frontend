import React from "react";

export default function SummaryCards({ totalIn, totalOut, net, label }) {
  const fmt = Intl.NumberFormat("vi-VN");
  const badge =
    net >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700";
  return (
    <div>
      <div className="rounded-2xl bg-white shadow p-5  mb-3">
        <div className="mt-1 text-3xl font-semibold">{label}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white shadow p-5">
          <div className="text-sm text-gray-500">Tổng thu</div>
          <div className="mt-1 text-2xl font-semibold">
            {fmt.format(totalIn)}₫
          </div>
        </div>
        <div className="rounded-2xl bg-white shadow p-5">
          <div className="text-sm text-gray-500">Tổng chi</div>
          <div className="mt-1 text-2xl font-semibold">
            {fmt.format(totalOut)}₫
          </div>
        </div>
        <div className="rounded-2xl bg-white shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Dòng tiền ròng</div>
              <div className="mt-1 text-2xl font-semibold">
                {fmt.format(net)}₫
              </div>
            </div>
            <span className={"px-3 py-1 rounded-full text-xs " + badge}>
              {net >= 0 ? "Dương" : "Âm"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
