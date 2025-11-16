import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="bg-gray-50">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              Finance & Accounting Dashboard
            </h1>
            <div className="flex gap-[8px]">
              <h2 className="cursor-pointer" onClick={() => navigate("/")}>
                Cashflow
              </h2>
              |
              <h2 className="cursor-pointer" onClick={() => navigate("/Budget")}>
                Budget
              </h2>
              |
              <h2 className="cursor-pointer" onClick={() => navigate("/Invoice")}>
                Invoice
              </h2>
            </div>
          </div>
        </header>
      </div>
    </>
  );
};
