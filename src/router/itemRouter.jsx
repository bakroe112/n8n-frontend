import { createBrowserRouter } from "react-router-dom";
import DashboardCashflow from "../page/DashBoardCashflow";
import { Layout } from "../layout/Layout";
import Budget from "../page/Budget";

export const itemRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <DashboardCashflow />, children: [] },
      { path: "/Buget", element: <Budget />, children: [] },
    ],
  },
]
);
