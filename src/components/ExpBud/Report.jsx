import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = "app.bakroe.site:4000";

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://${API_URL}/api/reports/latest`);
      if (res.data) {
        setReport(res.data);
      } else {
        setReport(null);
      }
    } catch (err) {
      console.error("Lỗi khi tải báo cáo:", err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const COLORS = [
    "#0088FE", "#FF0013", "#00C49F", "#FFBB28",
    "#FF8042", "#767887", "#468691", "#AA787C",
    "#D0ED57", "#A28FD0", "#FF6699", "#33CCFF",
    "#FF9933", "#99CC00", "#FF6666"
  ];

  // Lọc các danh mục có chi tiêu > 0 để hiển thị trong biểu đồ
  const pieData = report?.categories?.filter(c => c.spent > 0) || [];

  return (
    <div className="reports-container">
      <h2>📑 Báo cáo chi tiêu</h2>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : !report ? (
        <p className="no-data">⚠️ Không có báo cáo nào.</p>
      ) : (
        <>
          {/* Tổng quan */}
          <div style={{ marginBottom: "20px" }}>
            <p><strong>Tổng chi tiêu:</strong> {report.totalSpent.toLocaleString()} VND</p>
            <p><strong>Ngân sách:</strong> {report.totalBudget.toLocaleString()} VND</p>
            <p><strong>Tỷ lệ sử dụng:</strong> {report.percentUsed.toFixed(2)}%</p>
          </div>

          {/* Bảng chi tiết */}
          <table className="table">
            <thead>
              <tr>
                <th>Danh mục</th>
                <th>Chi tiêu</th>
                <th>Ngân sách</th>
                <th>Tỷ lệ (%)</th>
              </tr>
            </thead>
            <tbody>
              {report.categories.map((r, i) => (
                <tr key={i}>
                  <td>{r.category}</td>
                  <td>{r.spent.toLocaleString()} VND</td>
                  <td>{r.budget.toLocaleString()} VND</td>
                  <td>{r.percent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Biểu đồ tròn */}
          <div className="chart-box" style={{ margin: "50px", width: "100%", height: 550 }}>
            <h3>Tỷ lệ chi tiêu theo danh mục</h3>
            {pieData.length === 0 ? (
              <p>Không có dữ liệu chi tiêu để hiển thị biểu đồ.</p>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="spent"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    label
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={80} />
                  
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
