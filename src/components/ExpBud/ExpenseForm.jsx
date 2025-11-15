import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMoneyBillWave, FaSave, FaTrash, FaEdit } from "react-icons/fa";
import "../../../App.css"; // Import CSS riêng nếu có

function ExpenseForm() {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([]); // để lưu các năm có dữ liệu
  const API_URL = "app.bakroe.site";

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`http://${API_URL}/api/budgets`);
        const unique = [...new Set(res.data.map((b) => b.category))];
        setCategories(unique);
        if (unique.length > 0) setCategory(unique[0]);
      } catch (err) {
        console.error("Lỗi khi lấy categories:", err);
      }
    };
    fetchCategories();
  }, []);


  // Fetch expenses
  // const fetchExpenses = async () => {
  //   try {
  //     const res = await axios.get("http://localhost:5000/api/expenses");
  //     setExpenses(res.data);
  //   } catch (err) {
  //     console.error("Lỗi khi lấy expenses:", err);
  //   }
  // };

  // useEffect(() => {
  //   fetchExpenses();
  // }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`https://${API_URL}/api/expenses/${year}/${month}`);
      setExpenses(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy expenses:", err);
    }
  };

  // gọi lại mỗi khi year hoặc month đổi
  useEffect(() => {
    fetchExpenses();
  }, [year, month]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await axios.get(`https://${API_URL}/api/expenses/years`);
        setYears(res.data);
        if (res.data.length > 0) setYear(res.data[res.data.length - 1]); // default năm mới nhất
      } catch (err) {
        console.error("Lỗi khi lấy years:", err);
      }
    };
    fetchYears();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !amount || isNaN(amount) || Number(amount) <= 0) {
      alert("⚠️ Vui lòng nhập thông tin hợp lệ.");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`https://${API_URL}/api/expenses/${editingId}`, {
          category,
          amount: Number(amount),
          description,
          date,
        });
        alert("✏️ Cập nhật thành công!");
        setEditingId(null);
      } else {
        await axios.post(`https://${API_URL}/api/expenses`, {
          category,
          amount: Number(amount),
          description,
          date,
        });
        alert("✅ Thêm thành công!");
      }

      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory(categories[0] || "");

      fetchExpenses();
    } catch (err) {
      console.error("Lỗi khi thêm/sửa:", err);
      alert("❌ Lỗi khi lưu dữ liệu");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      await axios.delete(`https://${API_URL}/api/expenses/${id}`);
      setExpenses(expenses.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

  const handleEdit = (exp) => {
    setEditingId(exp._id);
    setCategory(exp.category);
    setAmount(exp.amount);
    setDescription(exp.description);
    setDate(exp.date.split("T")[0]);
  };

  return (
    <div className="page-container">
      <div className="form-grid">
        {/* FORM bên trái */}
        {/* <div className="form-section">
          <h2 className="form-title">
            <FaMoneyBillWave className="icon" />
            {editingId ? "Cập Nhật Chi Tiêu" : "Thêm Chi Tiêu"}
          </h2>
          <form onSubmit={handleSubmit}>
            <label>Danh mục</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>

            <label>Số tiền</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />

            <label>Mô tả</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ví dụ: Ăn sáng, cà phê..."
            />

            <label>Ngày</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

            <button type="submit" className="save-btn">
              <FaSave /> {editingId ? "Cập Nhật" : "Lưu"}
            </button>
          </form>
        </div> */}

        {/* TABLE bên phải */}
        <div className="table-section">
          <h2 className="table-title">📄 Danh sách Chi Tiêu</h2>

          {/* bộ lọc tháng năm */}
          <div className="filter-bar">
            <label>Tháng: </label>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>

            <label>Năm: </label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>


          <table>
            <thead>
              <tr>
                <th>Danh mục</th>
                <th>Số tiền</th>
                <th>Mô tả</th>
                <th>Ngày</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp._id}>
                  <td>{exp.category}</td>
                  <td>{exp.amount}</td>
                  <td>{exp.description}</td>
                  <td>{new Date(exp.date).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <button className="action-btn edit" onClick={() => handleEdit(exp)}>
                      <FaEdit />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(exp._id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>Chưa có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ExpenseForm;
