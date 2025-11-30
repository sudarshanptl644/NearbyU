import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/login";
import StudentHome from "./components/studentHome";
import VendorDetails from "./components/vendorDetails";
import CategoryPage from "./components/categoryPage"; // Import the new page
import VendorDashboard from "./components/vendorDashboard";
import RegisterShop from "./components/registerShop";
import Profile from "./components/profile"; // Import Profile
import SubscriptionPage from "./components/SubscriptionPage"; // NEW
import VendorRegister from "./components/VendorRegister"; // NEW
import PaymentGateway from "./components/PaymentGateway"; // NEW
import PaymentSelection from "./components/PaymentSelection"; // NEW
import EditShop from "./components/EditShop"; // NEW
import Marketplace from "./components/marketPlace";
import SellItem from "./components/sellItem"; // NEW
import FavoritesPage from "./components/favorites"; // NEW IMPORT

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/student-home" element={<StudentHome />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/sell-item" element={<SellItem />} /> {/* NEW ROUTE */}
      <Route path="/favorites" element={<FavoritesPage />} /> {/* NEW ROUTE */}
      <Route path="/shop-details" element={<VendorDetails />} />
      <Route path="/category/:categoryName" element={<CategoryPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/vendor-dashboard" element={<VendorDashboard />} />
      <Route path="/register-shop" element={<RegisterShop />} />
      <Route path="/edit-shop" element={<EditShop />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/payment-selection" element={<PaymentSelection />} />
      <Route path="/payment-gateway" element={<PaymentGateway />} />
      <Route path="/vendor-signup" element={<VendorRegister />} />
    </Routes>
  );
}

export default App;
