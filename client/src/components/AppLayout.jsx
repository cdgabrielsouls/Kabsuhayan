import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthDialog } from "../pages/public/PublicPages";
import { demoProducts, getListingStock, getOfferPrice, getOfferTypes } from "../data/demoProducts";

const navigation = [
  ["/app/marketplace", "Home", "home"],
  ["/app/cart", "Cart", "cart"],
  ["/app/swipe", "Swipe", "swipe"],
  ["/app/messages", "Chat", "chat"],
  ["/app/profile", "Profile", "profile"],
];

function NavIcon({ name }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "home") return <svg viewBox="0 0 24 24" {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></svg>;
  if (name === "cart") return <svg viewBox="0 0 24 24" {...common}><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>;
  if (name === "swipe") return <svg viewBox="0 0 24 24" {...common}><path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11 5a1.5 1.5 0 0 1 3 0v6-4a1.5 1.5 0 0 1 3 0v5-2a1.5 1.5 0 0 1 3 0v5.5a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.4-1.9L4 16.2a1.7 1.7 0 0 1 2.4-2.4L8 15.3" /><path d="M4 5H2m2 0L2 3m2 2L2 7" /></svg>;
  if (name === "chat") return <svg viewBox="0 0 24 24" {...common}><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.5-.7L4 20l1.2-3.5A7.2 7.2 0 0 1 4 12c0-4.1 3.6-7.5 8-7.5s8 3.1 8 7z" /><circle cx="8.5" cy="12" r=".6" /><circle cx="12" cy="12" r=".6" /><circle cx="15.5" cy="12" r=".6" /></svg>;
  return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="7.5" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
}

const defaultProfile = { fullName: "Arnold Angel Gabriel Solis", studentNumber: "2024-12345", email: "student@cvsu.edu.ph", campus: "Indang Main Campus" };

function loadProfile() {
  try {
    return { ...defaultProfile, ...JSON.parse(localStorage.getItem("kabsuhayan-demo-profile") || "{}") };
  } catch {
    return defaultProfile;
  }
}

function loadLocalValue(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export default function AppLayout() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [orders, setOrders] = useState(() => loadLocalValue("kabsuhayan-demo-orders", []));
  const [stockOverrides, setStockOverrides] = useState(() => loadLocalValue("kabsuhayan-demo-stock", {}));
  const [profile, setProfile] = useState(loadProfile);
  const [notifications, setNotifications] = useState([{ id: "welcome", title: "Welcome to KabsuHayán", message: "Browse campus items and arrange meetups with students.", time: "Just now", read: false }]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem("kabsuhayan-demo-user") === "yes");
  const [listingType, setListingType] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [authDialog, setAuthDialog] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const showSearch = ["/", "/app/home", "/app/marketplace"].includes(location.pathname);
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    if (location.pathname === "/") setListingType("all");
  }, [location.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem("kabsuhayan-demo-orders", JSON.stringify(orders));
      localStorage.setItem("kabsuhayan-demo-stock", JSON.stringify(stockOverrides));
    } catch {
      // The demo still works for this session when browser storage is unavailable.
    }
  }, [orders, stockOverrides]);

  const addNotification = (title, message) => {
    setNotifications((current) => [{ id: `notice-${Date.now()}`, title, message, time: "Just now", read: false }, ...current]);
  };

  const openAuthDialog = (nextPath = location.pathname) => {
    setAuthDialog({ nextPath });
  };

  // FUTURE API CONNECTION: pass query to GET /api/products?search=... from the marketplace page.
  const toggleFavorite = (id) => {
    if (!isLoggedIn) {
      openAuthDialog(location.pathname + location.search);
      return false;
    }
    setFavorites((current) => current.includes(id)
      ? current.filter((favoriteId) => favoriteId !== id)
      : [...current, id]);
    // FUTURE API CONNECTION: POST or DELETE /api/favorites/:productId.
    return true;
  };

  const requireLogin = (nextPath = location.pathname) => {
    if (isLoggedIn) return true;
    openAuthDialog(nextPath);
    return false;
  };

  const finishDemoLogin = () => {
    sessionStorage.setItem("kabsuhayan-demo-user", "yes");
    setIsLoggedIn(true);
  };

  const logout = () => {
    sessionStorage.removeItem("kabsuhayan-demo-user");
    window.location.assign("/");
  };

  const addListing = (listing) => {
    const nextListing = { ...listing, id: `local-${Date.now()}`, sellerName: "You", symbol: "▱", status: "available" };
    setMyListings((current) => [nextListing, ...current]);
    addNotification("Listing published", `${listing.title} is now in your listings.`);
    // FUTURE API CONNECTION: POST /api/products and upload photos to image storage.
  };

  const updateListing = (id, updates) => setMyListings((current) => current.map((listing) => listing.id === id ? { ...listing, ...updates } : listing));
  const deleteListing = (id) => setMyListings((current) => current.filter((listing) => listing.id !== id));
  const saveProfile = (updates) => {
    const nextProfile = { ...profile, ...updates };
    setProfile(nextProfile);
    localStorage.setItem("kabsuhayan-demo-profile", JSON.stringify(nextProfile));
  };

  const getStock = (product) => stockOverrides[product.id] ?? getListingStock(product);

  const addOrder = (product, offerType, transactionPrice) => {
    const pendingForProduct = orders.filter((order) => order.productId === product.id && order.orderStatus !== "Completed" && order.orderStatus !== "Cancelled").length;
    if (getStock(product) - pendingForProduct <= 0) return false;
    const selectedOffer = offerType || getOfferTypes(product)[0];
    setOrders((current) => [{
      ...product,
      orderId: `order-${Date.now()}`,
      productId: product.id,
      offerType: selectedOffer,
      transactionPrice: transactionPrice ?? getOfferPrice(product, selectedOffer),
      quantity: 1,
      orderedAt: new Date().toISOString(),
      orderStatus: "Pending",
      meetupLocation: "CvSU Indang Main Campus",
    }, ...current]);
    addNotification("Order added", `${product.title} was added to your Cart.`);
    // FUTURE API CONNECTION: create a persistent order with POST /api/orders.
    return true;
  };

  const updateOrder = (orderId, updates) => {
    setOrders((current) => current.map((order) => order.orderId === orderId ? { ...order, ...updates } : order));
  };

  const completeOrder = (orderId) => {
    const order = orders.find((item) => item.orderId === orderId);
    if (!order || order.orderStatus === "Completed") return;
    const product = myListings.find((item) => item.id === order.productId) || demoProducts.find((item) => item.id === order.productId) || order;
    const remaining = Math.max(0, getStock(product) - order.quantity);
    if (myListings.some((item) => item.id === order.productId)) {
      updateListing(order.productId, { stock: remaining, ...(remaining === 0 ? { status: order.offerType === "rent" ? "rented" : "sold" } : {}) });
    } else {
      setStockOverrides((current) => ({ ...current, [order.productId]: remaining }));
    }
    setOrders((current) => current.map((item) => item.orderId === orderId ? { ...item, orderStatus: "Completed", completedAt: new Date().toISOString() } : item));
    addNotification("Transaction completed", `${order.title} was added to your transaction history.`);
  };

  const pageContext = {
    query,
    setQuery,
    listingType,
    setListingType,
    favorites,
    toggleFavorite,
    myListings,
    addListing,
    updateListing,
    deleteListing,
    orders,
    addOrder,
    updateOrder,
    completeOrder,
    getStock,
    isLoggedIn,
    profile,
    saveProfile,
    requireLogin,
    finishDemoLogin,
    logout,
  };

  return (
    <div className="app-shell">
      <aside className="desktop-nav" aria-label="Main navigation">
        <Link className="nav-mark" to="/app/home" aria-label="KabsuHayán home">K</Link>
        {navigation.map(([to, label, icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span className={`nav-icon nav-icon-${icon}`} aria-hidden="true"><NavIcon name={icon} /></span>
            <span>{label}</span>
          </NavLink>
        ))}
        <Link className="nav-admin-link" to="/admin">Admin demo</Link>
      </aside>

      <header className="app-header">
        <Link className="brand" to="/app/home">
          <span className="brand-avatar" aria-hidden="true" />
          <span><b>Kabsuhayan</b><small>Indang Main Campus</small></span>
        </Link>
        {showSearch && (
          <div className="search-tools">
            <label className="header-search">
              <span aria-hidden="true" className="search-icon"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.5 4.5" /></svg></span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campus items" aria-label="Search campus items" />
            </label>
            <div className="filter-wrap">
              <button className="header-filter" aria-label="Filter listings" aria-expanded={filterOpen} onClick={() => setFilterOpen((open) => !open)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/></svg>
              </button>
              {filterOpen && <div className="header-filter-menu"><strong>Listing type</strong>{[["all", "All items"], ["sale", "Buy items"], ["rent", "Rental items"]].map(([value, label]) => <button key={value} className={listingType === value ? "selected" : ""} onClick={() => { setListingType(value); setFilterOpen(false); }}>{label}</button>)}</div>}
            </div>
          </div>
        )}
        <div className="header-actions">
          <button className="header-bell" aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`} onClick={() => { if (!requireLogin(location.pathname)) return; setNotificationsOpen((open) => !open); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>{unreadNotifications > 0 && <i />}
          </button>
          {isLoggedIn && <Link className="header-profile" to="/app/profile" aria-label="Open profile">A</Link>}
          {notificationsOpen && <div className="notification-popover"><div className="notification-heading"><strong>Notifications</strong><button type="button" onClick={() => setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))}>Mark all read</button></div>{notifications.length ? notifications.map((notification) => <article className={`notification-item ${notification.read ? "read" : "unread"}`} key={notification.id}><b>{notification.title}</b><p>{notification.message}</p><small>{notification.time}</small></article>) : <p>You’re all caught up.</p>}</div>}
        </div>
      </header>

      <main className="app-content">
        <Outlet context={pageContext} />
      </main>

      <nav className="mobile-nav" aria-label="Main navigation">
        {navigation.map(([to, label, icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}
          >
            <span className={`mobile-nav-icon mobile-nav-icon-${icon}`} aria-hidden="true"><NavIcon name={icon} /></span>
            <small>{label}</small>
          </NavLink>
        ))}
      </nav>

      {authDialog && <AuthDialog onClose={() => setAuthDialog(null)} onSuccess={() => {
        const nextPath = authDialog.nextPath;
        finishDemoLogin();
        setAuthDialog(null);
        navigate(nextPath);
      }} />}
    </div>
  );
}
