// Small local sample set for the UI preview. Replace with GET /api/products later.
export const demoProducts = [
  { id: "book-atomic", title: "Atomic Habits", price: 250, type: "sale", category: "Books", categoryLabel: "Books", condition: "Good", sellerName: "Mika R.", description: "Paperback copy. A few notes inside, but all pages are intact.", symbol: "▤", imageUrl: "/images/atomic-habits.png", photoTone: "tone-sand" },
  { id: "book-money", title: "The Psychology of Money", price: 200, type: "sale", category: "Books", categoryLabel: "Books", condition: "Like new", sellerName: "Paolo D.", description: "Clean copy. Can meet near the library after class.", symbol: "▤", imageUrl: "/images/psychology-money.png", photoTone: "tone-green" },
  { id: "book-rich-dad", title: "Rich Dad Poor Dad", price: 180, type: "sale", category: "Books", categoryLabel: "Books", condition: "Good", sellerName: "Kim S.", description: "Paperback copy with a few notes on the first pages.", symbol: "▤", imageUrl: "/images/rich-dad.png", photoTone: "tone-sand" },
  { id: "book-algorithms", title: "Introduction to Algorithms", price: 40, type: "rent", category: "Books", categoryLabel: "Books", condition: "Good", sellerName: "Ana L.", description: "Rent per day. Please message to agree on pickup and return.", symbol: "▤", imageUrl: "/images/algorithms.png", photoTone: "tone-rose" },
  { id: "green-shirt", title: "Green T-Shirt Oversize", price: 250, type: "sale", category: "Uniforms", categoryLabel: "Uniforms", condition: "Like new", sellerName: "Mika R.", description: "Tiger graphic oversize tee, size L. Worn twice, no stains.", symbol: "♧", imageUrl: "/images/green-shirt.png", photoTone: "tone-green" },
  { id: "uniform-pe", title: "PE Uniform Set", price: 450, type: "sale", category: "Uniforms", categoryLabel: "Uniforms", condition: "Good", sellerName: "Paolo D.", description: "Shirt and jogging pants, size M. Washed and ready to use.", symbol: "♧", photoTone: "tone-blue" },
  { id: "calculator", title: "Scientific Calculator", price: 600, salePrice: 600, rentalPricePerDay: 30, availableFor: ["buy", "rent"], stock: 2, type: "both", category: "Electronics", categoryLabel: "Electronics", condition: "Like new", sellerName: "Jerome T.", description: "Buy it for ₱600 or rent it for ₱30 per day. Works well and includes the protective slide cover.", symbol: "▣", photoTone: "tone-charcoal" },
  { id: "lab-gown", title: "Lab Gown · Size M", price: 20, type: "rent", category: "Uniforms", categoryLabel: "Uniforms", condition: "Good", sellerName: "Carlo B.", description: "Clean lab gown. Rental price is per day.", symbol: "♧", photoTone: "tone-paper" },
  { id: "drawing-kit", title: "Engineering Drawing Set", price: 300, type: "sale", category: "School supplies", categoryLabel: "School supplies", condition: "Good", sellerName: "Dan P.", description: "T-square, triangles, compass, and templates. Complete set.", symbol: "⌁", photoTone: "tone-sand" },
  { id: "desk-fan", title: "Desk Fan", price: 25, type: "rent", category: "Others", categoryLabel: "Others", condition: "Good", sellerName: "Joy N.", description: "Three-speed fan. Rental price is per day or week.", symbol: "◉", photoTone: "tone-blue" },
];

export function getOfferTypes(product) {
  if (Array.isArray(product.availableFor) && product.availableFor.length) return product.availableFor;
  if (product.type === "both") return ["buy", "rent"];
  return [product.type === "rent" ? "rent" : "buy"];
}

export function getOfferPrice(product, offerType) {
  if (offerType === "rent") return Number(product.rentalPricePerDay ?? (product.type === "rent" ? product.price : 0));
  return Number(product.salePrice ?? product.price ?? 0);
}

export function getListingStock(product) {
  return Math.max(0, Number(product.stock ?? 1));
}
