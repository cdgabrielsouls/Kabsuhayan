import { useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { getListingStock, getOfferPrice, getOfferTypes } from "../../data/demoProducts";

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
  const { query, favorites, toggleFavorite, listingType, setListingType, listings, getStock, listingsLoading, listingError } = useOutletContext();
  const [category, setCategory] = useState("All categories");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [sort, setSort] = useState("newest");

  const products = useMemo(() => {
    const result = listings.map((product) => ({ ...product, stock: getStock(product) })).filter((product) => {
      if (product.status && product.status !== "available") return false;
      if (getListingStock(product) <= 0) return false;
      const matchesText = `${product.title} ${product.category} ${product.sellerName}`.toLowerCase().includes(query.toLowerCase());
      const offers = getOfferTypes(product);
      const matchesType = listingType === "all" || offers.includes(listingType === "sale" ? "buy" : "rent");
      const matchesCategory = category === "All categories" || product.category === category;
      const matchesPrice = !maximumPrice || offers.some((offer) => getOfferPrice(product, offer) <= Number(maximumPrice));
      return matchesText && matchesType && matchesCategory && matchesPrice;
    });
    const lowestPrice = (product) => Math.min(...getOfferTypes(product).map((offer) => getOfferPrice(product, offer)));
    if (sort === "low") result.sort((a, b) => lowestPrice(a) - lowestPrice(b));
    if (sort === "high") result.sort((a, b) => lowestPrice(b) - lowestPrice(a));
    return result;
  }, [query, listingType, category, maximumPrice, sort, listings, getStock]);

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

      {listingError && <p className="form-notice" role="alert">Hindi makakonekta sa database: {listingError}. Tiyaking umaandar ang server at MongoDB.</p>}
      {listingsLoading ? <p className="empty-state">Kinukuha ang mga item…</p> : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)} onToggleFavorite={toggleFavorite} />)}</div> : <div className="empty-state"><h2>Wala pang item dito</h2><p>Ikaw ang unang mag-post. Puwede kang maglagay ng libro, uniform, o gamit sa klase.</p><Link className="button button-primary" to="/app/profile/new">Mag-post ng item</Link></div>}
    </section>
  );
}

export function CartPage() {
  const {
    cartItems,
    listings,
    removeFromCart,
    setCartQuantity,
    checkoutCart,
    requireLogin,
    getStock,
  } = useOutletContext();
  const [selectedKeys, setSelectedKeys] = useState(() => cartItems.map((item) => `${item.productId}:${item.offerType}`));
  const [notice, setNotice] = useState("");

  const items = cartItems.map((item) => {
    const product = listings.find((listing) => listing.id === item.productId);
    return product ? { ...item, product, key: `${item.productId}:${item.offerType}` } : null;
  }).filter(Boolean);
  const allSelected = items.length > 0 && items.every((item) => selectedKeys.includes(item.key));
  const selectedItems = items.filter((item) => selectedKeys.includes(item.key));
  const total = selectedItems.reduce((sum, item) => sum + getOfferPrice(item.product, item.offerType) * item.quantity, 0);

  const toggleItem = (key) => setSelectedKeys((current) => current.includes(key)
    ? current.filter((itemKey) => itemKey !== key)
    : [...current, key]);

  const checkout = () => {
    if (!requireLogin("/app/cart")) return;
    const result = checkoutCart(selectedKeys);
    if (result.addedCount) {
      setNotice(`${result.addedCount} ${result.addedCount === 1 ? "item was" : "items were"} moved to Orders.`);
      setSelectedKeys([]);
    } else {
      setNotice("The selected item is no longer available. Refresh the page and try again.");
    }
    if (result.skippedCount) setNotice(`${result.addedCount} item(s) checked out. Some were unavailable and stayed in your cart.`);
  };

  return <section className="cart-page">
    <p className="eyebrow">YOUR BAG</p>
    <h1>Cart</h1>
    <p className="page-intro">Choose what you’re ready to order.</p>
    {notice && <p className="form-notice" role="status">{notice}</p>}
    {!items.length ? <div className="empty-state"><h2>Your cart is empty</h2><p>Add something from the marketplace and it’ll show up here.</p><Link className="button button-primary" to="/app/marketplace">Browse items</Link></div> : <>
      <div className="cart-select-all">
        <label><input type="checkbox" checked={allSelected} onChange={() => setSelectedKeys(allSelected ? [] : items.map((item) => item.key))} /> Select all</label>
        <span>{selectedItems.length} selected</span>
      </div>
      <div className="shopping-cart-list">
        {items.map((item) => {
          const { product, offerType, quantity, key } = item;
          const unitPrice = getOfferPrice(product, offerType);
          return <article className="shopping-cart-item" key={key}>
            <label className="cart-item-select"><input type="checkbox" checked={selectedKeys.includes(key)} onChange={() => toggleItem(key)} aria-label={`Select ${product.title}`} /></label>
            <div className={`cart-item-photo ${product.photoTone || "tone-paper"}`}>{product.imageUrl ? <img src={product.imageUrl} alt={product.title} /> : <span>{product.symbol || "▱"}</span>}</div>
            <div className="cart-item-info">
              <span className={`order-type-badge ${offerType}`}>{offerType === "rent" ? "Rent" : "Buy"}</span>
              <h2>{product.title}</h2>
              <p>{product.category} · {product.condition}</p>
              <strong>₱{unitPrice.toLocaleString("en-PH")}{offerType === "rent" ? <small> / day</small> : null}</strong>
              <div className="cart-item-controls">
                <div className="quantity-control" aria-label={`Quantity for ${product.title}`}>
                  <button type="button" onClick={() => setCartQuantity(key, quantity - 1)} aria-label="Decrease quantity">−</button>
                  <span>{quantity}</span>
                  <button type="button" disabled={quantity >= getStock(product)} onClick={() => setCartQuantity(key, quantity + 1)} aria-label="Increase quantity">+</button>
                </div>
                <button type="button" className="text-link" onClick={() => removeFromCart(key)}>Remove</button>
              </div>
            </div>
            <strong className="cart-item-subtotal">₱{(unitPrice * quantity).toLocaleString("en-PH")}</strong>
          </article>;
        })}
      </div>
      <aside className="cart-checkout-bar">
        <div><span>{selectedItems.reduce((sum, item) => sum + item.quantity, 0)} item(s) selected</span><strong>₱{total.toLocaleString("en-PH")}</strong></div>
        <button className="button button-primary" type="button" onClick={checkout} disabled={!selectedItems.length}>Check out selected</button>
      </aside>
    </>}
  </section>;
}

export function OrdersPage() {
  const { orders, updateOrder, completeOrder } = useOutletContext();
  const [activeTab, setActiveTab] = useState("All");
  const orderTabs = ["All", "To ship", "To receive", "To review", "Returns"];
  const visibleOrders = activeTab === "All"
    ? orders
    : orders.filter((order) => order.orderStatus === activeTab);

  const chooseMeetupPin = (event, order) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - bounds.left) / bounds.width) * 100);
    const y = Math.round(((event.clientY - bounds.top) / bounds.height) * 100);
    updateOrder(order.orderId, { meetupPin: { x, y }, meetupLocation: `Campus meetup pin · ${x}% / ${y}%` });
  };

  return <section className="cart-page">
    <p className="eyebrow">YOUR ACTIVITY</p>
    <h1>Orders</h1>
    <p className="page-intro">Track your orders and sort them by where they are in the process.</p>
    <nav className="order-tabs" aria-label="Filter orders">
      {orderTabs.map((tab) => {
        const count = tab === "All" ? orders.length : orders.filter((order) => order.orderStatus === tab).length;
        return <button key={tab} type="button" className={`order-tab ${activeTab === tab ? "active" : ""}`} aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)}>{tab}<span>{count}</span></button>;
      })}
    </nav>
    {!visibleOrders.length ? <div className="empty-state"><h2>{orders.length ? `No orders in “${activeTab}”` : "No orders yet"}</h2><p>{orders.length ? "When an order reaches this step, it will show up here." : "Once you order something, you can follow it here."}</p>{!orders.length && <Link className="button button-primary" to="/app/marketplace">Browse items</Link>}</div> :
      <div className="order-list">{visibleOrders.map((order) => {
        return <article className="order-card" key={order.orderId}>
          <div className={`order-photo ${order.photoTone || "tone-paper"}`}>{order.imageUrl ? <img src={order.imageUrl} alt={order.title} /> : <span>{order.symbol || "▱"}</span>}</div>
          <div className="order-main"><div className="order-title-row"><div><span className={`order-type-badge ${order.offerType}`}>{order.offerType === "rent" ? "Rent" : "Buy"}</span><h2>{order.title}</h2></div><strong className="order-price">₱{Number(order.transactionPrice ?? order.price).toLocaleString("en-PH")}{order.offerType === "rent" ? <small> / day</small> : null}</strong></div>
            <p className="order-seller">From {order.sellerName} · {new Date(order.orderedAt).toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" })}</p>
            <span className="order-status"><i />{order.orderStatus}</span>
            {order.orderStatus === "To ship" && <div className="transaction-complete-row"><button className="button button-primary" type="button" onClick={() => updateOrder(order.orderId, { orderStatus: "To receive", shippedAt: new Date().toISOString() })}>Mark as shipped</button><small>Move this order to To receive when it’s on the way.</small></div>}
            {order.orderStatus === "To receive" && <div className="transaction-complete-row"><button className="button button-primary" type="button" onClick={() => updateOrder(order.orderId, { orderStatus: "To review", receivedAt: new Date().toISOString() })}>Mark as received</button><button className="button button-secondary" type="button" onClick={() => updateOrder(order.orderId, { orderStatus: "Returns", returnRequestedAt: new Date().toISOString() })}>Request a return</button></div>}
            {order.orderStatus === "To review" && <div className="transaction-complete-row"><button className="button button-primary" type="button" onClick={() => completeOrder(order.orderId)}>Mark as reviewed</button><small>After reviewing, the order moves to your history.</small></div>}
            {order.orderStatus === "Returns" && <div className="transaction-complete-row"><span className="field-hint">Return requested</span><button className="button button-secondary" type="button" onClick={() => updateOrder(order.orderId, { orderStatus: "To review" })}>Cancel return</button></div>}
            {order.orderStatus === "Completed" && <p className="transaction-complete-note">Reviewed {new Date(order.completedAt || order.orderedAt).toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" })} · in your transaction history</p>}
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
    <p className="demo-caption">Order updates are saved in this browser for now.</p>
  </section>;
}

export function ProductDetailsPage() {
  const { id } = useParams();
  const { favorites, toggleFavorite, listings, requireLogin, addToCart, getStock } = useOutletContext();
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();
  const product = listings.find((item) => item.id === id);
  if (!product) return <section className="simple-page"><h1>Listing not found</h1><Link to="/app/marketplace">Back to Marketplace</Link></section>;
  const offers = getOfferTypes(product);
  const stock = getStock(product);
  const unavailable = stock <= 0 || Boolean(product.status && product.status !== "available");

  const addItem = (offerType) => {
    if (unavailable) {
      setNotice("This listing is out of stock.");
      return;
    }
    const added = addToCart(product, offerType);
    setNotice(added ? "Added to your cart." : "You’ve added all available stock to your cart.");
  };
  const messageSeller = () => {
    if (requireLogin(`/app/products/${product.id}`)) navigate("/app/messages");
  };

  return <section className="details-page"><Link className="back-link" to="/app/marketplace">← Back to Marketplace</Link><div className="details-grid"><div className={`details-photo ${product.photoTone || "tone-paper"}`}>{product.imageUrl ? <img src={product.imageUrl} alt={product.title} /> : <span>{product.symbol || "▱"}</span>}</div><div className="details-copy"><p className="eyebrow">{offers.length > 1 ? "FOR SALE · FOR RENT" : offers[0] === "rent" ? "FOR RENT" : "FOR SALE"} · {product.category}</p><h1>{product.title}</h1>{offers.map((offer) => <p className="details-price" key={offer}>{offer === "buy" ? "Buy" : "Rent"}: ₱{getOfferPrice(product, offer).toLocaleString("en-PH")}{offer === "rent" ? <small> / day</small> : null}</p>)}<p className="stock-line">{stock} {stock === 1 ? "item" : "items"} available</p><p className="details-description">{product.description}</p><p className="seller-line"><span className="person-mark">{product.sellerName?.[0] || "S"}</span><span><b>{product.sellerName}</b><small>CvSU student · Indang Main Campus</small></span></p><div className="details-actions">{offers.map((offer) => <button key={offer} className={`button ${offer === offers[0] ? "button-primary" : "button-secondary"}`} disabled={unavailable} onClick={() => addItem(offer)}>{unavailable ? "Out of stock" : `Add to cart · ₱${getOfferPrice(product, offer).toLocaleString("en-PH")}${offer === "rent" ? "/day" : ""}`}</button>)}<button className="button button-secondary" onClick={messageSeller}>Message seller</button><button className="button button-secondary" onClick={() => toggleFavorite(product.id)}>{favorites.includes(product.id) ? "Saved" : "Save listing"}</button></div>{notice && <p className="order-notice">{notice}</p>}<p className="demo-caption">For rentals, agree on the meetup and return details directly with the student.</p></div></div></section>;
}
