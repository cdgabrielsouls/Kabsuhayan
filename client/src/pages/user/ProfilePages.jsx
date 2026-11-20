import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import ProductForm from "../../components/ProductForm";

function ProfileTabs({ active }) {
  return <nav className="profile-tabs" aria-label="Profile sections">
    <Link className={active === "profile" ? "active" : ""} to="/app/profile">Profile</Link>
    <Link className={active === "listings" ? "active" : ""} to="/app/profile/listings">My listings</Link>
    <Link className={active === "favorites" ? "active" : ""} to="/app/profile/favorites">Favorites</Link>
    <Link className={active === "history" ? "active" : ""} to="/app/profile/history">History</Link>
    <Link className={active === "settings" ? "active" : ""} to="/app/profile/settings">Settings</Link>
  </nav>;
}

export function ProfilePage() {
  const { myListings, favorites, profile } = useOutletContext();
  return <section className="profile-page">
    <p className="eyebrow">YOUR ACCOUNT</p><h1>Profile</h1><p className="page-intro">Your student account works for buying, selling, and renting.</p>
    <ProfileTabs active="profile" />
    <div className="profile-summary-card"><div className="profile-avatar">{profile.fullName?.[0] || "S"}</div><div><p className="verified-label">Student account</p><h2>{profile.fullName}</h2><p>{profile.campus}</p><small>{profile.email} · {profile.studentNumber}</small></div></div>
    <div className="profile-shortcuts"><Link to="/app/profile/listings"><span>My listings</span><b>{myListings.length}</b></Link><Link to="/app/profile/favorites"><span>Favorites</span><b>{favorites.length}</b></Link><Link to="/app/profile/history"><span>Transaction history</span><b>View</b></Link></div>
    <div className="profile-post-prompt"><div><h2>Have something useful to share?</h2><p>Post it for sale or rent it to another student.</p></div><Link className="button button-primary" to="/app/profile/new">Post an item</Link></div>
  </section>;
}

export function MyListingsPage() {
  const { myListings, updateListing, deleteListing, listingError } = useOutletContext();
  const [editing, setEditing] = useState(null);
  const saveEdit = (values) => {
    updateListing(editing.id, values);
    setEditing(null);
  };
  return <section className="profile-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>My listings</h1><p className="page-intro">Manage the items you have posted for sale or rent.</p><ProfileTabs active="listings" />
    {listingError && <p className="form-notice" role="alert">{listingError}</p>}
    {editing && <ProductForm key={editing.id} initialValues={editing} onSubmit={saveEdit} onCancel={() => setEditing(null)} />}
    {myListings.length ? <div className="product-grid">{myListings.map((item) => <div key={item.id}><ProductCard product={item} /><div className="listing-manage"><label>Status<select value={item.status || "available"} onChange={(event) => updateListing(item.id, { status: event.target.value })}><option value="available">Available</option><option value="sold">Sold</option><option value="rented">Rented</option></select></label><button type="button" onClick={() => { setEditing(item); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button><button type="button" className="danger-link" onClick={() => deleteListing(item.id)}>Delete</button></div></div>)}</div> : !editing && <div className="empty-state"><h2>No listings yet</h2><p>When you post an item, you’ll be able to manage it here.</p><Link className="button button-primary" to="/app/profile/new">Post an item</Link></div>}
  </section>;
}

export function FavoritesPage() {
  const { favorites, toggleFavorite, listings } = useOutletContext();
  const products = listings.filter((item) => favorites.includes(item.id));
  return <section className="profile-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>Favorites</h1><p className="page-intro">Listings you saved while browsing or swiping.</p><ProfileTabs active="favorites" />
    {products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} isFavorite onToggleFavorite={() => toggleFavorite(product.id)} />)}</div> : <div className="empty-state"><h2>No saved items yet</h2><p>Tap the heart on a listing to keep it here.</p><Link className="text-link" to="/app/marketplace">Browse Marketplace</Link></div>}
  </section>;
}

export function TransactionHistoryPage() {
  const { orders } = useOutletContext();
  const transactions = orders.filter((order) => order.orderStatus === "Completed").sort((a, b) => new Date(b.completedAt || b.orderedAt) - new Date(a.completedAt || a.orderedAt));
  return <section className="profile-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>Transaction history</h1><p className="page-intro">Completed purchases and rentals appear here.</p><ProfileTabs active="history" />
    {transactions.length ? <div className="transaction-history-list">{transactions.map((order) => <article className="transaction-history-card" key={order.orderId}><span className={`order-type-badge ${order.offerType}`}>{order.offerType === "rent" ? "Rental" : "Purchase"}</span><div><h2>{order.title}</h2><small>{new Date(order.completedAt || order.orderedAt).toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" })} · {order.sellerName}</small></div><strong>₱{Number(order.transactionPrice ?? order.price).toLocaleString("en-PH")}{order.offerType === "rent" ? <small> / day</small> : null}</strong><span className={`history-status ${order.orderStatus === "Completed" ? "complete" : "pending"}`}>{order.orderStatus}</span>{order.orderStatus !== "Completed" && <Link to="/app/cart">View in Cart</Link>}</article>)}</div> : <div className="empty-state"><h2>No transactions yet</h2><p>Completed purchases and rentals will appear here.</p><Link className="button button-secondary" to="/">Browse items</Link></div>}
  </section>;
}

export function NewListingPage() {
  const { addListing, listingError } = useOutletContext();
  const navigate = useNavigate();
  const submit = async (listing) => {
    if (await addListing(listing)) navigate("/app/profile/listings");
  };
  return <section className="profile-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>Post an item</h1><p className="page-intro">Ilagay ang detalye at presyo, tapos puwede mo itong baguhin anumang oras.</p>{listingError && <p className="form-notice" role="alert">Hindi na-save ang item: {listingError}</p>}<ProductForm onSubmit={submit} onCancel={() => navigate("/app/profile")} /></section>;
}


export function SettingsPage() {
  const { profile, saveProfile, logout } = useOutletContext();
  const [fullName, setFullName] = useState(profile.fullName);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setNotice("");
    setSaving(true);
    try {
      await saveProfile({ fullName: fullName.trim() });
      setSaved(true);
    } catch (error) {
      setNotice(error.message);
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (confirmed) {
      logout();
    }
  };

  return (
    <section className="profile-page">
      <p className="eyebrow">YOUR ACCOUNT</p>
      <h1>Settings</h1>
      <p className="page-intro">
        Review your student details and account preferences.
      </p>

      <ProfileTabs active="settings" />

      <form className="settings-form" onSubmit={submit}>
        <label>
          Full name
          <input
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value);
              setSaved(false);
            }}
            required
          />
        </label>

        <label>
          Student number
          <input value={profile.studentNumber} readOnly />
        </label>

        <label>
          CvSU email
          <input type="email" value={profile.email} readOnly />
        </label>

        <label className="check-row">
          <input type="checkbox" defaultChecked />
          Email me when I get a new message
        </label>

        <button className="button button-primary" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>

        <small>
          {notice || (saved ? "Profile changes saved to your account." : "Your account details come from your profile.")}
        </small>
      </form>

      <div className="settings-logout">
        <h3>Account</h3>
        <p>Ready to leave KabsuHayan?</p>

        <button
          type="button"
          className="button"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </section>
  );
}
