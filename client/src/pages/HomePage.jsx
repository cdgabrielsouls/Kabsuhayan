import { useEffect, useState } from "react";
import { getProducts } from "../services/api";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;
  if (products.length === 0) return <p>No products yet.</p>;

  return (
    <main>
      <h1>Available Campus Items</h1>

      <section className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product._id}>
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.title} />
            )}
            <h2>{product.title}</h2>
            <p>₱{product.price}</p>
            <p>{product.category} · {product.condition}</p>
            <small>Seller: {product.sellerName}</small>
          </article>
        ))}
      </section>
    </main>
  );
}