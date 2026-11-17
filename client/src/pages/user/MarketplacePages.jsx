import { useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router";
import ProductCard from "../../components/ProductCard";
import { demoProducts } from "../../data/demoProducts";

const categories = ["Books", "Uniforms", "Electronics", "School supplies", "Others"];

function CategoryIcon({ index }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  if (index === 0) return <svg viewBox="0 0 24 24" {...common}><path d="M4 5.5h5a3 3 0 0 1 3 3v11a3 3 0 0 0-3-2.5H4z"/><path d="M20 5.5h-5a3 3 0 0 0-3 3v11a3 3 0 0 1 3-2.5h5z"/></svg>;
  if (index === 1) return <svg viewBox="0 0 24 24" {...common}><path d="m8 4 4 2 4-2 4 3-2 4-2-1v10H8V10l-2 1-2-4z"/><path d="M10 7h4"/></svg>;
  if (index === 2) return <svg viewBox="0 0 24 24" {...common}><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M10 6h4M11 18h2"/></svg>;
  if (index === 3) return <svg viewBox="0 0 24 24" {...common}><path d="m4 17 12-12 4 4L8 21H4z"/><path d="m13 8 3 3M10 11l2 2M7 14l2 2"/></svg>;
  return <svg viewBox="0 0 24 24" {...common}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>;
}

function ListingTypeIcon({ type }) {
  if (type === "sale") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>;
  if (type === "rent") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>;
  return null;
}

export function HomePage() {
  return <MarketplacePage isHome />;
}

export function MarketplacePage({ isHome = false }) {
  const { query, favorites, toggleFavorite, listingType, setListingType, myListings } = useOutletContext();
  const [category, setCategory] = useState("All categories");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [sort, setSort] = useState("newest");

  // FUTURE API CONNECTION: load products from GET /api/products?search=&type=&category=&maxPrice=.
  const products = useMemo(() => {
    const result = [...myListings, ...demoProducts].filter((product) => {
      if (product.status && product.status !== "available") return false;
      const matchesText = `${product.title} ${product.category} ${product.sellerName}`.toLowerCase().includes(query.toLowerCase());
      const matchesType = listingType === "all" || product.type === listingType;
      const matchesCategory = category === "All categories" || product.category === category;
      const matchesPrice = !maximumPrice || product.price <= Number(maximumPrice);
      return matchesText && matchesType && matchesCategory && matchesPrice;
    });
    if (sort === "low") result.sort((a, b) => a.price - b.price);
    if (sort === "high") result.sort((a, b) => b.price - a.price);
    return result;
  }, [query, listingType, category, maximumPrice, sort, myListings]);

  return (
    <section className={`market-page ${isHome ? "is-home" : ""}`}>
      <div className="market-heading">
        <div>
          <p className="eyebrow">INDANG MAIN CAMPUS</p>
          <h1>{isHome ? "Campus finds" : "Marketplace"}</h1>
          <p className="page-intro">{isHome ? "Useful things students are selling or renting nearby." : "Browse listings from fellow CvSU students."}</p>
        </div>
        <Link className="button button-secondary post-link" to="/app/profile/new">Post an item</Link>
      </div>

      <div className="filter-section"><p>FILTER LISTING TYPE</p><div className="listing-filter" aria-label="Listing type">
        {[ ["all", "All items"], ["sale", "Buy items"], ["rent", "Rental items"] ].map(([id, label]) => (
          <button key={id} className={listingType === id ? "selected" : ""} onClick={() => setListingType(id)}><ListingTypeIcon type={id} />{label}</button>
        ))}
      </div></div>

      <div className="category-heading"><h2>Categories</h2><button className="text-link" onClick={() => setCategory("All categories")}>Clear</button></div>
      <div className="category-row">
        {categories.map((name, index) => (
          <button key={name} className={`category-tile category-${index} ${category === name ? "selected" : ""}`} onClick={() => setCategory(category === name ? "All categories" : name)}>
            <CategoryIcon index={index} /><small>{name}</small>
          </button>
        ))}
      </div>

      <div className="results-heading"><div><h2>{isHome ? "Available campus items" : "All listings"}</h2><small>{products.length} {products.length === 1 ? "item" : "items"}</small></div>
        <div className="result-controls"><label>Up to ₱<input type="number" min="0" value={maximumPrice} onChange={(event) => setMaximumPrice(event.target.value)} placeholder="Any price" /></label><select aria-label="Sort listings" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
      </div>

      {products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)} onToggleFavorite={toggleFavorite} />)}</div> : <div className="empty-state"><h2>No items match those filters</h2><p>Try another category or clear the price limit.</p><button className="button button-secondary" onClick={() => { setCategory("All categories"); setListingType("all"); setMaximumPrice(""); }}>Clear filters</button></div>}
      <p className="demo-caption">Sample listings for the UI preview. Listing photos and data are not connected yet.</p>
    </section>
  );
}

export function CartPage() {
  const { orders, updateOrder } = useOutletContext();

  const chooseMeetupPin = (event, order) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - bounds.left) / bounds.width) * 100);
    const y = Math.round(((event.clientY - bounds.top) / bounds.height) * 100);
    updateOrder(order.orderId, { meetupPin: { x, y }, meetupLocation: `Campus meetup pin · ${x}% / ${y}%` });
  };

  return <section className="cart-page">
    <p className="eyebrow">YOUR ACTIVITY</p>
    <h1>Cart &amp; orders</h1>
    <p className="page-intro">Items you ordered and the campus meetup pin for each one.</p>
    {!orders.length ? <div className="empty-state"><h2>No orders yet</h2><p>Browse campus listings and order an item to see it here.</p><Link className="button button-primary" to="/">Browse items</Link></div> :
      <div className="order-list">{orders.map((order) => {
        return <article className="order-card" key={order.orderId}>
          <div className={`order-photo ${order.photoTone || "tone-paper"}`}>{order.imageUrl ? <img src={order.imageUrl} alt={order.title} /> : <span>{order.symbol || "▱"}</span>}</div>
          <div className="order-main"><div className="order-title-row"><div><span className={`order-type-badge ${order.type}`}>{order.type === "rent" ? "For rent" : "For sale"}</span><h2>{order.title}</h2></div><strong className="order-price">₱{Number(order.price).toLocaleString("en-PH")}{order.type === "rent" ? <small> / day</small> : null}</strong></div>
            <p className="order-seller">From {order.sellerName} · {new Date(order.orderedAt).toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" })}</p>
            <span className="order-status"><i />{order.orderStatus}</span>
            <div className="meetup-card"><div className="meetup-heading"><span className="map-pin-icon"><svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></span><div><b>Meet-up location</b><small>Confirm the exact point with the seller in chat.</small></div></div>
              <div className="meetup-fields"><input aria-label={`Location for ${order.title}`} value={order.meetupLocation} onChange={(event) => updateOrder(order.orderId, { meetupLocation: event.target.value })} placeholder="Enter a campus meetup point" /></div>
              <div className="campus-map-heading"><b>Pin a meetup point</b><small>Tap the map to place or move your pin.</small></div>
              <button className="campus-map" type="button" onClick={(event) => chooseMeetupPin(event, order)} aria-label={`Choose a meetup pin for ${order.title}`}>
                <svg className="campus-map-roads" viewBox="0 0 600 190" preserveAspectRatio="none" aria-hidden="true"><path d="M-20 145 C110 130 130 35 260 50 S420 160 630 25"/><path d="M100 -10 C150 50 210 90 190 210"/><path d="M360 -10 C330 60 440 95 460 205"/><path d="M-20 80 C150 100 350 45 620 120"/></svg>
                <span className="campus-map-block block-one"/><span className="campus-map-block block-two"/><span className="campus-map-block block-three"/><span className="campus-map-label">Campus meetup area</span>
                {order.meetupPin && <span className="campus-map-marker" style={{ left: `${order.meetupPin.x}%`, top: `${order.meetupPin.y}%` }}><svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></span>}
              </button>
              <div className="map-link"><span>{order.meetupPin ? `Pinned point: ${order.meetupPin.x}%, ${order.meetupPin.y}%` : "No pin selected yet"}</span><a href="https://www.google.com/maps/search/?api=1&query=Cavite+State+University+Indang+Main+Campus" target="_blank" rel="noreferrer">Open CvSU in Maps ↗</a></div>
              <small className="map-disclaimer">Schematic preview only. It selects a meetup pin and does not track live location.</small>
            </div>
          </div>
        </article>;
      })}</div>}
    <p className="demo-caption">Orders and meetup details are saved in this page preview only.</p>
  </section>;
}

export function ProductDetailsPage() {
  const { id } = useParams();
  const { favorites, toggleFavorite, myListings, requireLogin, addOrder } = useOutletContext();
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();
  const product = [...demoProducts, ...myListings].find((item) => item.id === id);
  if (!product) return <section className="simple-page"><h1>Listing not found</h1><Link to="/app/marketplace">Back to Marketplace</Link></section>;

  const order = () => {
    if (!requireLogin(`/app/products/${product.id}`)) return;
    if (product.status && product.status !== "available") {
      setNotice(`This listing is marked ${product.status}.`);
      return;
    }
    addOrder(product);
    setNotice("Added to your orders. Open Cart to set up a meetup or delivery.");
  };
  const messageSeller = () => {
    if (requireLogin(`/app/products/${product.id}`)) navigate("/app/messages");
  };

  return <section className="details-page"><Link className="back-link" to="/">← Back to Marketplace</Link><div className="details-grid"><div className={`details-photo ${product.photoTone || "tone-paper"}`}>{product.imageUrl ? <img src={product.imageUrl} alt={product.title} /> : <span>{product.symbol || "▱"}</span>}</div><div className="details-copy"><p className="eyebrow">{product.type === "rent" ? "FOR RENT" : "FOR SALE"} · {product.category}</p><h1>{product.title}</h1><p className="details-price">₱{Number(product.price).toLocaleString("en-PH")}{product.type === "rent" ? <small> / day</small> : null}</p><p className="details-description">{product.description}</p><p className="seller-line"><span className="person-mark">{product.sellerName?.[0] || "S"}</span><span><b>{product.sellerName}</b><small>CvSU student · Indang Main Campus</small></span></p><div className="details-actions"><button className="button button-primary" disabled={Boolean(product.status && product.status !== "available")} onClick={order}>{product.status && product.status !== "available" ? product.status[0].toUpperCase() + product.status.slice(1) : product.type === "rent" ? "Request to rent" : "Order this item"}</button><button className="button button-secondary" onClick={messageSeller}>Message seller</button><button className="button button-secondary" onClick={() => toggleFavorite(product.id)}>{favorites.includes(product.id) ? "Saved" : "Save listing"}</button></div>{notice && <p className="order-notice">{notice}</p>}<p className="demo-caption">Agree on price, meetup, or rental terms directly with the student.</p></div></div></section>;
}
