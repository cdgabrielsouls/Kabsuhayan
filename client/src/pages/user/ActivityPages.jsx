import { useRef, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import MessagePanel from "../../components/MessagePanel";
import { demoProducts, getListingStock, getOfferPrice, getOfferTypes } from "../../data/demoProducts";

const swipeDemoProducts = [demoProducts.find((product) => product.id === "green-shirt"), ...demoProducts.filter((product) => product.id !== "green-shirt")];

export function SwipePage() {
  const { favorites, toggleFavorite, requireLogin, myListings, getStock } = useOutletContext();
  const [index, setIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState("");
  const dragStart = useRef(null);
  const suppressCardClick = useRef(false);
  const navigate = useNavigate();
  const swipeProducts = [...myListings, ...swipeDemoProducts].map((product) => ({ ...product, stock: getStock(product) })).filter((product) => (!product.status || product.status === "available") && getListingStock(product) > 0);
  const item = swipeProducts[index % swipeProducts.length];
  if (!item) return <section className="swipe-page"><div className="empty-state"><h2>You’re all caught up</h2><p>There are no available items to swipe through right now.</p></div></section>;
  const offers = getOfferTypes(item);
  const next = () => {
    setDetailsOpen(false);
    setDragOffset(0);
    setExitDirection("");
    setIndex((current) => (current + 1) % swipeProducts.length);
  };
  const previous = () => {
    setDetailsOpen(false);
    setDragOffset(0);
    setExitDirection("");
    setIndex((current) => (current - 1 + swipeProducts.length) % swipeProducts.length);
  };
  const save = () => {
    if (toggleFavorite(item.id)) next();
  };
  const interested = () => {
    if (!requireLogin("/app/swipe")) {
      setDragOffset(0);
      setExitDirection("");
      return;
    }
    if (!favorites.includes(item.id)) toggleFavorite(item.id);
    next();
  };
  const startDrag = (event) => {
    if (detailsOpen || event.button !== 0 || event.target.closest("button, a, .swipe-details-sheet")) return;
    dragStart.current = { pointerId: event.pointerId, x: event.clientX, width: event.currentTarget.getBoundingClientRect().width };
    suppressCardClick.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event) => {
    if (!dragStart.current || dragStart.current.pointerId !== event.pointerId) return;
    const delta = event.clientX - dragStart.current.x;
    if (Math.abs(delta) > 8) suppressCardClick.current = true;
    setDragOffset(delta);
  };
  const finishDrag = (event) => {
    if (!dragStart.current || dragStart.current.pointerId !== event.pointerId) return;
    const { x, width } = dragStart.current;
    const delta = event.clientX - x;
    dragStart.current = null;
    setIsDragging(false);
    const threshold = Math.max(75, width * 0.22);
    if (delta > threshold) {
      setExitDirection("right");
      window.setTimeout(interested, 220);
    } else if (delta < -threshold) {
      setExitDirection("left");
      window.setTimeout(next, 220);
    } else {
      setDragOffset(0);
    }
  };
  const cancelDrag = (event) => {
    if (!dragStart.current || dragStart.current.pointerId !== event.pointerId) return;
    dragStart.current = null;
    setIsDragging(false);
    setDragOffset(0);
    setExitDirection("");
  };
  const cardTransform = exitDirection
    ? `translateX(${exitDirection === "right" ? "115%" : "-115%"}) rotate(${exitDirection === "right" ? "14deg" : "-14deg"})`
    : `translateX(${dragOffset}px) rotate(${Math.max(-12, Math.min(12, dragOffset / 24))}deg)`;

  return <section className="swipe-page">
    <div className="swipe-banner"><div><h1>SWIPE &amp; DISCOVER</h1><p>Find items or swipe left to skip</p></div><Link to="/app/profile/favorites" className="saved-count">♥ {favorites.length} Saved</Link></div>
    <div className="swipe-card-stage">
      <button className="swipe-arrow swipe-arrow-left" onClick={previous} aria-label="Previous item"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg></button>
      <div className={`swipe-card ${detailsOpen ? "details-open" : ""} ${isDragging ? "is-dragging" : ""}`} style={{ transform: cardTransform, transition: isDragging ? "none" : "transform 220ms ease, opacity 220ms ease", opacity: exitDirection ? 0 : 1 }}>
      <div className={`swipe-photo ${item.photoTone || "tone-paper"}`} role="group" aria-label={`Product card for ${item.title}`} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={cancelDrag} onClick={() => { if (suppressCardClick.current) { suppressCardClick.current = false; return; } setDetailsOpen((open) => !open); }}>
        {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <span>{item.symbol}</span>}
        <div className="swipe-photo-shade" />
        {Math.abs(dragOffset) > 18 && <span className={`swipe-drag-feedback ${dragOffset > 0 ? "interested" : "skip"}`}>{dragOffset > 0 ? "INTERESTED" : "SKIP"}</span>}
        <span className="swipe-listing-type">{offers.length > 1 ? "For sale + rent" : offers[0] === "rent" ? "For rent" : "For sale"}</span>
        <div className="swipe-corner-actions">
          <button className="swipe-corner-action save-corner" onClick={(event) => { event.stopPropagation(); save(); }} aria-label="Save item" aria-pressed={favorites.includes(item.id)}><svg viewBox="0 0 24 24"><path d="M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z" /></svg>{favorites.includes(item.id) ? "Saved" : "Save"}</button>
          <button className="swipe-corner-action skip-corner" onClick={(event) => { event.stopPropagation(); next(); }} aria-label="Skip item">Skip <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></button>
        </div>
        <div className="swipe-photo-copy"><h2>{item.title}</h2><p>{item.category} · {item.stock} available</p><div className="swipe-price-options">{offers.map((offer) => <strong key={offer}>{offer === "buy" ? "Buy" : "Rent"} ₱{getOfferPrice(item, offer).toLocaleString("en-PH")}{offer === "rent" ? " / day" : ""}</strong>)}</div></div>
        <button className="swipe-info" onClick={(event) => { event.stopPropagation(); setDetailsOpen((open) => !open); }} aria-expanded={detailsOpen} aria-label={detailsOpen ? "Hide item details" : "Show item details"}>i</button>
        <div className="swipe-details-sheet" aria-hidden={!detailsOpen} inert={!detailsOpen} onClick={(event) => event.stopPropagation()}>
          <p className="eyebrow">ITEM DETAILS</p><h2>{item.title}</h2>
          <div className="swipe-detail-prices">{offers.map((offer) => <strong key={offer}>{offer === "buy" ? "Buy" : "Rent"} ₱{getOfferPrice(item, offer).toLocaleString("en-PH")}{offer === "rent" ? " / day" : ""}</strong>)}</div>
          <p>{item.description}</p>
          <small>Listed by {item.sellerName} · {item.category}</small>
          <Link to={`/app/products/${item.id}`} onClick={(event) => event.stopPropagation()}>Open full listing <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      </div>
      <button className="swipe-arrow swipe-arrow-right" onClick={next} aria-label="Next item"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg></button>
    </div>
    <div className="swipe-actions">
      <button className="skip-action" onClick={next} aria-label="Skip item"><svg viewBox="0 0 24 24"><path d="m5 5 14 14M19 5 5 19" /></svg></button>
      <button className="message-action" onClick={() => { if (requireLogin("/app/swipe")) navigate("/app/messages"); }} aria-label="Message seller"><svg viewBox="0 0 24 24"><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.5-.7L4 20l1.2-3.5A7.2 7.2 0 0 1 4 12c0-4.1 3.6-7.5 8-7.5s8 3.1 8 7z" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" /></svg></button>
      <button className="interested-action" onClick={interested} aria-label="Interested"><svg viewBox="0 0 24 24"><path d="M13.3 2 5.5 13h5.8L10.7 22 18.5 11h-5.8z" /></svg></button>
      <button className="save-action" onClick={save} aria-label="Save item"><svg viewBox="0 0 24 24"><path d="M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z" /></svg></button>
    </div>
    <p className="swipe-hint">Tap a button to skip, message, show interest, or save this item.</p>
  </section>;
}

export function MessagesPage() {
  return <section className="messages-page"><p className="eyebrow">YOUR INBOX</p><h1>Messages</h1><p className="page-intro">Message a student to ask about a listing or arrange a campus meetup.</p><MessagePanel /></section>;
}
