import React, { useState } from "react";
import BudgetForm from "../components/ExpBud/BudgetForm";
import ExpenseForm from "../components/ExpBud/ExpenseForm";
import Report from "../components/ExpBud/Report";

function Budget() {
  const [activeTab, setActiveTab] = useState("budget");

  return (
    <div className="app-container">
      <h1 className="app-header">💰 QUẢN LÝ CHI TIÊU </h1>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "budget" ? "active" : ""}`}
          onClick={() => setActiveTab("budget")}
        >
          📊 Ngân sách
        </button>
        <button
          className={`tab-btn ${activeTab === "expense" ? "active" : ""}`}
          onClick={() => setActiveTab("expense")}
        >
          💸 Chi tiêu
        </button>
        <button
          className={`tab-btn ${activeTab === "report" ? "active" : ""}`}
          onClick={() => setActiveTab("report")}
        >
          📑 Báo cáo
        </button>
      </div>

      <div className="form-wrapper">
        {activeTab === "budget" && <BudgetForm />}
        {activeTab === "expense" && <ExpenseForm />}
        {activeTab === "report" && <Report />}
      </div>
    </div>
  );
}

export default Budget;