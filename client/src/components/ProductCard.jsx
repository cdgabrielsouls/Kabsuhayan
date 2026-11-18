import { Link } from "react-router-dom";
import { getOfferPrice, getOfferTypes, getListingStock } from "../data/demoProducts";

export default function ProductCard({ product, isFavorite = false, onToggleFavorite }) {
  const offers = getOfferTypes(product);
  const stock = getListingStock(product);
  return (
    <article className="product-card">
      <Link className="product-photo-link" to={`/app/products/${product.id}`}>
        <div className={`product-photo ${product.photoTone || "tone-paper"}`}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.title} />
          ) : (
            <span className="photo-placeholder" aria-hidden="true">{product.symbol || "□"}</span>
          )}
          <span className={`listing-tag ${offers.length > 1 ? "both" : offers[0]}`}>{offers.length > 1 ? "For sale + rent" : offers[0] === "rent" ? "For rent" : "For sale"}</span>
        </div>
      </Link>
      <button
        className={`favorite-button ${isFavorite ? "saved" : ""}`}
        type="button"
        aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
        aria-pressed={isFavorite}
        onClick={() => onToggleFavorite?.(product.id)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z" /></svg>
      </button>
      <div className="product-info">
        <Link to={`/app/products/${product.id}`} className="product-title">{product.title}</Link>
        {offers.length > 1 ? <div className="product-price product-price-both"><span>Buy ₱{getOfferPrice(product, "buy").toLocaleString("en-PH")}</span><span>Rent ₱{getOfferPrice(product, "rent").toLocaleString("en-PH")}<small> / day</small></span></div> : <p className="product-price">₱{getOfferPrice(product, offers[0]).toLocaleString("en-PH")}{offers[0] === "rent" ? <small> / day</small> : null}</p>}
        <p className="product-meta">{product.categoryLabel || product.category} · {product.sellerName} · {stock} in stock</p>
      </div>
    </article>
  );
}
