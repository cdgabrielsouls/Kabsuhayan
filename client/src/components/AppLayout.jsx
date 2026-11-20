import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthDialog, Brand } from "../pages/public/PublicPages";
import { getListingStock } from "../data/demoProducts";
import { clearAuthSession, createOrders, createProduct, deleteProduct as deleteProductRequest, getCurrentUser, getOrders, getProducts, getStoredUser, updateCurrentUser, updateOrder as updateOrderRequest, updateProduct } from "../services/api";

const navigation = [
  ["/app/marketplace", "Home", "home"],
  ["/app/orders", "Orders", "orders"],
  ["/app/swipe", "Swipe", "swipe"],
  ["/app/messages", "Chat", "chat"],
  ["/app/profile", "Profile", "profile"],
];

function NavIcon({ name }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "home") return <svg viewBox="0 0 24 24" {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></svg>;
  if (name === "orders") return <svg viewBox="0 0 24 24" {...common}><rect x="4" y="5" width="16" height="17" rx="2" /><path d="M9 5V3h6v2M8 11h8M8 15h8M8 19h8" /></svg>;
  if (name === "swipe") return <svg viewBox="0 0 24 24" {...common}><path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11 5a1.5 1.5 0 0 1 3 0v6-4a1.5 1.5 0 0 1 3 0v5-2a1.5 1.5 0 0 1 3 0v5.5a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.4-1.9L4 16.2a1.7 1.7 0 0 1 2.4-2.4L8 15.3" /><path d="M4 5H2m2 0L2 3m2 2L2 7" /></svg>;
  if (name === "chat") return <svg viewBox="0 0 24 24" {...common}><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.5-.7L4 20l1.2-3.5A7.2 7.2 0 0 1 4 12c0-4.1 3.6-7.5 8-7.5s8 3.1 8 7z" /><circle cx="8.5" cy="12" r=".6" /><circle cx="12" cy="12" r=".6" /><circle cx="15.5" cy="12" r=".6" /></svg>;
  return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="7.5" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
}

function toProfile(user) {
  return {
    id: user?.id || "",
    fullName: user?.name || "",
    studentNumber: user?.studentNumber || "",
    email: user?.email || "",
    campus: user?.campus || "Indang Main Campus",
    role: user?.role || "user",
  };
}

function loadCartItems() {
  try {
    const saved = JSON.parse(localStorage.getItem("kabsuhayan-cart") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function getCartKey(item) {
  return `${item.productId}:${item.offerType}`;
}

export default function AppLayout() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [listings, setListings] = useState([]);
  const [listingError, setListingError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [listingsLoading, setListingsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState(loadCartItems);
  const [profile, setProfile] = useState(() => toProfile(getStoredUser()));
  const [notifications, setNotifications] = useState([{ id: "welcome", title: "Welcome to KabsuHayan", message: "Browse campus items and arrange meetups with students.", time: "Just now", read: false }]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(sessionStorage.getItem("kabsuhayan-token")));
  const [listingType, setListingType] = useState("all");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [authDialog, setAuthDialog] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const showSearch = ["/", "/app/home", "/app/marketplace"].includes(location.pathname);
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;
  const cartCount = cartItems.reduce((count, item) => count + Number(item.quantity || 1), 0);

  useEffect(() => {
    if (!sessionStorage.getItem("kabsuhayan-token")) return;
    getCurrentUser()
      .then(({ user }) => setProfile(toProfile(user)))
      .catch(() => {
        clearAuthSession();
        setProfile(toProfile(null));
        setIsLoggedIn(false);
      });
  }, []);

  useEffect(() => {
    getProducts()
      .then((products) => {
        setListings(products);
        setListingError("");
      })
      .catch((error) => setListingError(error.message))
      .finally(() => setListingsLoading(false));
  }, []);

  useEffect(() => {
    setMyListings(listings.filter((product) => String(product.sellerId) === String(profile.id)));
  }, [listings, profile.id]);

  useEffect(() => {
    if (!isLoggedIn || !profile.id) {
      setOrders([]);
      setOrdersError("");
      return;
    }
    getOrders()
      .then((savedOrders) => {
        setOrders(savedOrders);
        setOrdersError("");
      })
      .catch((error) => setOrdersError(error.message));
  }, [isLoggedIn, profile.id]);

  useEffect(() => {
    if (location.pathname === "/") setListingType("all");
    setNotificationsOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem("kabsuhayan-cart", JSON.stringify(cartItems));
      localStorage.removeItem("kabsuhayan-demo-orders");
      localStorage.removeItem("kabsuhayan-demo-stock");
    } catch {
      // The demo still works for this session when browser storage is unavailable.
    }
  }, [cartItems]);

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

  const finishLogin = (account) => {
    if (account?.user) setProfile(toProfile(account.user));
    setIsLoggedIn(true);
  };

  const logout = () => {
    clearAuthSession();
    setIsLoggedIn(false);
    setProfile(toProfile(null));
    window.location.assign("/");
  };

  const addListing = async (listing) => {
    try {
      const created = await createProduct({
        ...listing,
        status: "available",
      });
      setListings((current) => [created, ...current]);
      setMyListings((current) => [created, ...current]);
      setListingError("");
      addNotification("Listing published", `${listing.title} is now in your listings.`);
      return true;
    } catch (error) {
      setListingError(error.message);
      return false;
    }
  };

  const updateListing = async (id, updates) => {
    try {
      const saved = await updateProduct(id, updates);
      setListings((current) => current.map((listing) => listing.id === id ? saved : listing));
      setMyListings((current) => current.map((listing) => listing.id === id ? saved : listing));
      setListingError("");
      return true;
    } catch (error) {
      setListingError(error.message);
      return false;
    }
  };
  const deleteListing = async (id) => {
    try {
      await deleteProductRequest(id);
      setListings((current) => current.filter((listing) => listing.id !== id));
      setMyListings((current) => current.filter((listing) => listing.id !== id));
      setListingError("");
      return true;
    } catch (error) {
      setListingError(error.message);
      return false;
    }
  };
  const saveProfile = async (updates) => {
    const { user } = await updateCurrentUser({ name: updates.fullName });
    setProfile(toProfile(user));
  };

  const getStock = (product) => getListingStock(product);

  const addToCart = (product, offerType) => {
    const key = `${product.id}:${offerType}`;
    const existing = cartItems.find((item) => getCartKey(item) === key);
    const quantity = existing ? existing.quantity : 0;
    if (quantity >= getStock(product)) return false;

    setCartItems((current) => existing
      ? current.map((item) => getCartKey(item) === key ? { ...item, quantity: item.quantity + 1 } : item)
      : [{ productId: product.id, offerType, quantity: 1 }, ...current]);
    return true;
  };

  const removeFromCart = (key) => setCartItems((current) => current.filter((item) => getCartKey(item) !== key));

  const setCartQuantity = (key, quantity) => {
    if (quantity < 1) return removeFromCart(key);
    const item = cartItems.find((entry) => getCartKey(entry) === key);
    const product = listings.find((entry) => entry.id === item?.productId);
    if (!item || !product || quantity > getStock(product)) return;
    setCartItems((current) => current.map((entry) => getCartKey(entry) === key ? { ...entry, quantity } : entry));
  };

  const checkoutCart = async (selectedKeys) => {
    const selected = cartItems.filter((item) => selectedKeys.includes(getCartKey(item)));
    if (!selected.length) return { addedCount: 0, skippedCount: 0 };
    try {
      const result = await createOrders(selected.map(({ productId, offerType, quantity }) => ({ productId, offerType, quantity })));
      const newOrders = result.orders || [];
      const orderedKeys = new Set(newOrders.map((order) => `${order.productId}:${order.offerType}`));
      setOrders((current) => [...newOrders, ...current]);
      setCartItems((current) => current.filter((item) => !orderedKeys.has(getCartKey(item))));
      if (newOrders.length) {
        addNotification("Order placed", `${newOrders.length} ${newOrders.length === 1 ? "item is" : "items are"} now in Orders. Payment: cash on delivery.`);
        getProducts().then(setListings).catch((error) => setListingError(error.message));
      }
      return { addedCount: newOrders.length, skippedCount: result.skipped?.length || 0 };
    } catch (error) {
      return { addedCount: 0, skippedCount: selected.length, error: error.message };
    }
  };

  const updateOrder = async (orderId, updates) => {
    try {
      const { order } = await updateOrderRequest(orderId, updates);
      setOrders((current) => current.map((item) => item.orderId === orderId ? order : item));
      setOrdersError("");
      if (order.orderStatus === "Completed") {
        addNotification("Order successful", `${order.title} was completed. Cash on delivery was marked as paid.`);
      }
      return true;
    } catch (error) {
      setOrdersError(error.message);
      return false;
    }
  };

  const pageContext = {
    query,
    setQuery,
    listingType,
    setListingType,
    favorites,
    toggleFavorite,
    myListings,
    listings,
    listingError,
    listingsLoading,
    addListing,
    updateListing,
    deleteListing,
    orders,
    ordersError,
    accountId: profile.id,
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    setCartQuantity,
    checkoutCart,
    updateOrder,
    getStock,
    isLoggedIn,
    profile,
    saveProfile,
    requireLogin,
    finishLogin,
    logout,
  };

  return (
    <div className="app-shell">
      <aside className="desktop-nav" aria-label="Main navigation">
        <Link className="nav-mark" to="/app/home" aria-label="KabsuHayan home">K</Link>
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
        {isLoggedIn && profile.role === "admin" && <Link className="nav-admin-link" to="/admin">Admin</Link>}
      </aside>

      <header className="app-header">
        <Brand to="/app/home" />
        {showSearch && (
          <div className="search-tools">
            <label className="header-search">
              <span aria-hidden="true" className="search-icon"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.5 4.5" /></svg></span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campus items" aria-label="Search campus items" />
            </label>
          </div>
        )}
        <div className="header-actions">
          <Link className="header-cart" to="/app/cart" aria-label={`Open cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></svg>
            {cartCount > 0 && <span className="cart-count-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
          </Link>
          {isLoggedIn && <button className="header-profile" type="button" aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={profileMenuOpen} onClick={() => { setNotificationsOpen(false); setProfileMenuOpen((open) => !open); }}>{profile.fullName?.[0]?.toUpperCase() || "A"}</button>}
          {profileMenuOpen && <div className="profile-menu" role="menu">
            <strong>{profile.fullName || "Your account"}</strong>
            <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); setNotificationsOpen(true); }}>Notifications{unreadNotifications > 0 && <span>{unreadNotifications}</span>}</button>
            <Link role="menuitem" to="/app/profile/settings" onClick={() => setProfileMenuOpen(false)}>Settings</Link>
            <button type="button" role="menuitem" className="profile-menu-logout" onClick={() => { if (window.confirm("Log out of KabsuHayan?")) logout(); }}>Log out</button>
          </div>}
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

      {authDialog && <AuthDialog onClose={() => setAuthDialog(null)} onSuccess={(account) => {
        const nextPath = authDialog.nextPath;
        finishLogin(account);
        setAuthDialog(null);
        navigate(nextPath);
      }} />}
    </div>
  );
}
