import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import OrdersDashboard from "./pages/OrdersDashboard";
import OrderDetails from "./pages/OrderDetails";
import ClientQrVerify from "./pages/ClientQrVerify";
import AdminLogin from "./pages/AdminLogin";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("amana_agent");
      return saved ? JSON.parse(saved) : { nom: "Oumaima", role: "admin" };
    } catch {
      return { nom: "Oumaima", role: "admin" };
    }
  });

  return (
    <BrowserRouter>
      <AdminLayout
        user={currentUser}
        onLogout={() => setCurrentUser({ nom: "Oumaima", role: "admin" })}
      >
        <Routes>
          <Route path="/orders" element={<OrdersDashboard />} />
          <Route path="/orders/:colisId" element={<OrderDetails />} />
          <Route path="/colis/:colisId" element={<ClientQrVerify />} />
          <Route
            path="/login"
            element={<AdminLogin onLoginSuccess={(agent) => setCurrentUser(agent)} />}
          />
          <Route path="*" element={<Navigate to="/orders" replace />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
}