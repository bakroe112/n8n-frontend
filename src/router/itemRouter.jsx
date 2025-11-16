import { createBrowserRouter } from "react-router-dom";
import DashboardCashflow from "../page/DashBoardCashflow";
import { Layout } from "../layout/Layout";
import Budget from "../page/Budget";
import InvoicesDashboard from "../page/InvoicesDashboard";

export const itemRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <DashboardCashflow />, children: [] },
      { path: "/Budget", element: <Budget />, children: [] },
      { path: "/Invoice", element: <InvoicesDashboard />, children: [] },
    ],
  },
]
);
