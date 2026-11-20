import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useOutletContext } from "react-router-dom";
import AdminPages from "./pages/adminPage/AdminPages";
import AppLayout from "./components/AppLayout";
import CampusMap from "./components/CampusMap";
import LandingPage from "./pages/public/LandingPage";

import {
  ForgotPasswordPage,
  InlineLoginPage,
  LoginPage,
  RegisterPage,
  VerifyEmailPage,
} from "./pages/public/PublicPages";
import {
  FavoritesPage,
  MyListingsPage,
  NewListingPage,
  ProfilePage,
  SettingsPage,
  TransactionHistoryPage,
} from "./pages/user/ProfilePages";
import {
  CartPage,
  MarketplacePage,
  OrdersPage,
  ProductDetailsPage,
} from "./pages/user/MarketplacePages";
import { MessagesPage, SwipePage } from "./pages/user/ActivityPages";

function NotFoundPage() {
  return (
    <section className="simple-page">
      <p className="eyebrow">KABSUHAYAN</p>
      <h1>Page not found</h1>
      <p>The page may have moved or the address may be incorrect.</p>
      <a className="button button-primary" href="/app/home">Back to home</a>
    </section>
  );
}

function AuthPrompt({ nextPath }) {
  const { requireLogin } = useOutletContext();
  useEffect(() => { requireLogin(nextPath); }, []);
  return <section className="auth-inline"><p className="auth-intro">Log in or register to open this page.</p></section>;
}

function AuthRequired({ children, inline = false }) {
  const { isLoggedIn, finishDemoLogin } = useOutletContext();
  const location = useLocation();
  if (isLoggedIn) return children;
  if (!inline) return <AuthPrompt nextPath={location.pathname + location.search} />;
  return <InlineLoginPage nextPath={location.pathname + location.search} onSuccess={finishDemoLogin} />;
}

function MapTestPage() {
  return (
    <main style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Campus Map Test</h1>
      <p>Explore the CvSU Indang area.</p>

      <CampusMap />
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
    
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/map-test" element={<MapTestPage />} />

  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/verify-email" element={<VerifyEmailPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

  <Route element={<AppLayout />}>
    <Route path="/app" element={<Navigate to="/app/home" replace />} />
    <Route path="/app/home" element={<Navigate to="/app/marketplace" replace />} />
    <Route path="/app/marketplace" element={<MarketplacePage />} />
    <Route path="/app/cart" element={<CartPage />} />
    <Route path="/app/orders" element={<AuthRequired><OrdersPage /></AuthRequired>} />
    <Route path="/app/products/:id" element={<ProductDetailsPage />} />
    <Route path="/app/swipe" element={<SwipePage />} />
    <Route path="/app/messages" element={<AuthRequired><MessagesPage /></AuthRequired>} />
    <Route path="/app/profile" element={<AuthRequired inline><ProfilePage /></AuthRequired>} />
    <Route path="/app/profile/listings" element={<AuthRequired inline><MyListingsPage /></AuthRequired>} />
    <Route path="/app/profile/favorites" element={<AuthRequired inline><FavoritesPage /></AuthRequired>} />
    <Route path="/app/profile/history" element={<AuthRequired inline><TransactionHistoryPage /></AuthRequired>} />
    <Route path="/app/profile/new" element={<AuthRequired inline><NewListingPage /></AuthRequired>} />
    <Route path="/app/profile/settings" element={<AuthRequired inline><SettingsPage /></AuthRequired>} />
  </Route>

  <Route path="/admin/*" element={<AdminPages />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>

    </BrowserRouter>
  );
}
