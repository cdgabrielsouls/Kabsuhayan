import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import ProductCard from "../../components/ProductCard";
import ProductForm from "../../components/ProductForm";
import { demoProducts } from "../../data/demoProducts";

function ProfileTabs({ active }) {
  return <nav className="profile-tabs" aria-label="Profile sections">
    <Link className={active === "profile" ? "active" : ""} to="/app/profile">Profile</Link>
    <Link className={active === "listings" ? "active" : ""} to="/app/profile/listings">My listings</Link>
    <Link className={active === "favorites" ? "active" : ""} to="/app/profile/favorites">Favorites</Link>
    <Link className={active === "settings" ? "active" : ""} to="/app/profile/settings">Settings</Link>
  </nav>;
}

export function ProfilePage() {
  const { myListings, favorites, profile } = useOutletContext();
  return <section className="profile-page">
    <p className="eyebrow">YOUR ACCOUNT</p><h1>Profile</h1><p className="page-intro">Your student account works for buying, selling, and renting.</p>
    <ProfileTabs active="profile" />
    <div className="profile-summary-card"><div className="profile-avatar">{profile.fullName?.[0] || "S"}</div><div><p className="verified-label">CvSU student</p><h2>{profile.fullName}</h2><p>{profile.campus}</p><small>{profile.email} · {profile.studentNumber}</small></div></div>
    <div className="profile-shortcuts"><Link to="/app/profile/listings"><span>My listings</span><b>{myListings.length}</b></Link><Link to="/app/profile/favorites"><span>Favorites</span><b>{favorites.length}</b></Link></div>
    <div className="profile-post-prompt"><div><h2>Have something useful to share?</h2><p>Post it for sale or rent it to another student.</p></div><Link className="button button-primary" to="/app/profile/new">Post an item</Link></div>
  </section>;
}

export function MyListingsPage() {
  const { myListings, updateListing, deleteListing } = useOutletContext();
  const [editing, setEditing] = useState(null);
  const saveEdit = (values) => {
    updateListing(editing.id, values);
    setEditing(null);
  };
  return <section className="profile-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>My listings</h1><p className="page-intro">Manage the items you have posted for sale or rent.</p><ProfileTabs active="listings" />
    {editing && <ProductForm key={editing.id} initialValues={editing} onSubmit={saveEdit} onCancel={() => setEditing(null)} />}
    {myListings.length ? <div className="product-grid">{myListings.map((item) => <div key={item.id}><ProductCard product={item} /><div className="listing-manage"><label>Status<select value={item.status || "available"} onChange={(event) => updateListing(item.id, { status: event.target.value })}><option value="available">Available</option><option value="sold">Sold</option><option value="rented">Rented</option></select></label><button type="button" onClick={() => { setEditing(item); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button><button type="button" className="danger-link" onClick={() => deleteListing(item.id)}>Delete</button></div></div>)}</div> : !editing && <div className="empty-state"><h2>No listings yet</h2><p>When you post an item, you’ll be able to manage it here.</p><Link className="button button-primary" to="/app/profile/new">Post an item</Link></div>}
  </section>;
}

export function FavoritesPage() {
  const { favorites, toggleFavorite, myListings } = useOutletContext();
  const products = [...demoProducts, ...myListings].filter((item) => favorites.includes(item.id));
  return <section className="profile-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>Favorites</h1><p className="page-intro">Listings you saved while browsing or swiping.</p><ProfileTabs active="favorites" />
    {products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} isFavorite onToggleFavorite={() => toggleFavorite(product.id)} />)}</div> : <div className="empty-state"><h2>No saved items yet</h2><p>Tap the heart on a listing to keep it here.</p><Link className="text-link" to="/app/marketplace">Browse Marketplace</Link></div>}
  </section>;
}

export function NewListingPage() {
  const { addListing } = useOutletContext();
  const navigate = useNavigate();
  const submit = (listing) => {
    addListing(listing);
    navigate("/app/profile/listings");
  };
  return <section className="profile-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>Post an item</h1><p className="page-intro">Use the same account whether you’re selling or renting an item out.</p><ProductForm onSubmit={submit} onCancel={() => navigate("/app/profile")} /></section>;
}

export function SettingsPage() {
  const { profile, saveProfile } = useOutletContext();
  const [fullName, setFullName] = useState(profile.fullName);
  const [saved, setSaved] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    saveProfile({ fullName: fullName.trim() });
    setSaved(true);
  };
  return <section className="profile-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>Settings</h1><p className="page-intro">Review your student details and account preferences.</p><ProfileTabs active="settings" /><form className="settings-form" onSubmit={submit}><label>Full name<input value={fullName} onChange={(event) => { setFullName(event.target.value); setSaved(false); }} required /></label><label>Student number<input value={profile.studentNumber} readOnly /></label><label>CvSU email<input type="email" value={profile.email} readOnly /></label><label className="check-row"><input type="checkbox" defaultChecked /> Email me when I get a new message</label><button className="button button-primary">Save changes</button><small>{saved ? "Profile changes saved in this browser." : "Profile details are saved locally in this preview."}</small></form></section>;
}
