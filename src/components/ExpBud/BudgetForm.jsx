import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPiggyBank, FaSave, FaTrash, FaEdit } from "react-icons/fa";
import "../../../App.css"; // Import CSS riêng nếu có";

function BudgetForm() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [budgets, setBudgets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([]); // để lưu các năm có dữ liệu
  const API_URL = "backend.bakroe.site";
  const API_LOCAL = "10.60.129.96:4000";

  const fetchBudgets = async () => {
    try {
      const res = await axios.get(
        `https://${API_URL}/api/budgets/${year}/${month}`
      );
      setBudgets(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy budgets:", err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [year, month]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await axios.get(`https://${API_URL}/api/budgets/years`);
        setYears(res.data);
        if (res.data.length > 0) setYear(res.data[res.data.length - 1]); // default năm mới nhất
      } catch (err) {
        console.error("Lỗi khi lấy years:", err);
      }
    };
    fetchYears();
  }, []);

  // Function POST dữ liệu lên server
  const postBudgetToServer = async (budgetData) => {
    try {
      const response = await axios.post(`https://${API_URL}/api/budgets`, budgetData);
      console.log("✅ POST thành công:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Lỗi POST:", err);
      throw err;
    }
  };

  // Function PUT (update) dữ liệu trên server
  const putBudgetToServer = async (id, budgetData) => {
    try {
      const response = await axios.put(`https://${API_URL}/api/budgets/${id}`, budgetData);
      console.log("✅ PUT thành công:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Lỗi PUT:", err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !amount || isNaN(amount) || Number(amount) <= 0) {
      alert("⚠️ Vui lòng nhập thông tin hợp lệ.");
      return;
    }

    const budgetData = {
      category,
      amount: Number(amount),
      date: new Date(date),
    };

    try {
      if (editingId) {
        // Cập nhật dữ liệu có sẵn
        await putBudgetToServer(editingId, budgetData);
        alert("✏️ Cập nhật thành công!");
        setEditingId(null);
      } else {
        // Thêm dữ liệu mới
        await postBudgetToServer(budgetData);
        alert("✅ Thêm thành công!");
      }

      setAmount("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);

      fetchBudgets();
    } catch (err) {
      console.error("Lỗi khi thêm/sửa:", err);
      alert("❌ Lỗi khi lưu dữ liệu");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      await axios.delete(`https://${API_URL}/api/budgets/${id}`);
      setBudgets(budgets.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

  const handleEdit = (budget) => {
    setEditingId(budget._id);
    setCategory(budget.category);
    setAmount(budget.amount);
    setDate(
      budget.date
        ? new Date(budget.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
  };

  return (
    <div className="page-container">
      <div className="form-grid">
        {/* FORM SECTION */}
        <div className="form-section">
          <h2 className="form-title">
            <FaPiggyBank /> {editingId ? "✏️ Chỉnh sửa Ngân Sách" : "➕ Thêm Ngân Sách Mới"}
          </h2>
          <form onSubmit={handleSubmit} className="budget-form">
            <div className="form-group">
              <label htmlFor="category">Danh mục:</label>
              <input
                type="text"
                id="category"
                placeholder="VD: Ăn uống, Mua sắm, Giao thông..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Số tiền (VND):</label>
              <input
                type="number"
                id="amount"
                placeholder="VD: 500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="1000"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Ngày:</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <FaSave /> {editingId ? "Cập nhật" : "Thêm mới"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingId(null);
                    setCategory("");
                    setAmount("");
                    setDate(new Date().toISOString().split("T")[0]);
                  }}
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TABLE */}
        <div className="table-section">
          <h2 className="table-title">📊 Danh sách Ngân Sách</h2>

          {/* bộ lọc tháng năm */}
          <div className="filter-bar">
            <label>Tháng: </label>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            <label>Năm: </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <table>
            <thead>
              <tr>
                <th>Danh mục</th>
                <th>Số tiền</th>
                <th>Ngày</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => (
                <tr key={b._id}>
                  <td>{b.category}</td>
                  <td>{b.amount}</td>
                  <td>{new Date(b.date).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(b)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(b._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {budgets.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BudgetForm;
