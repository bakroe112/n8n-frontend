import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export const Layout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <footer className="max-w-7xl mx-auto px-4 py-8 text-center text-xs text-gray-500">
        © Dashboard.
      </footer>
    </>
  );
};
