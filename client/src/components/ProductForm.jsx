
import { useEffect, useState } from "react";
import CampusMap from "./CampusMap";

export default function ProductForm({ onSubmit, onCancel, initialValues = {} }) {
  const [form, setForm] = useState(() => ({
    title: "",
    description: "",
    category: "Books",
    type: "sale",
    condition: "Good",
    ...initialValues,
    availableFor: initialValues.availableFor || (initialValues.type === "both" ? ["buy", "rent"] : [initialValues.type === "rent" ? "rent" : "buy"]),
    salePrice: initialValues.salePrice ?? (initialValues.type !== "rent" ? initialValues.price ?? "" : ""),
    rentalPricePerDay: initialValues.rentalPricePerDay ?? (initialValues.type === "rent" ? initialValues.price ?? "" : ""),
    stock: initialValues.stock ?? 1,
  }));
  const [formNotice, setFormNotice] = useState("");
  const [meetupLocations, setMeetupLocations] = useState(
    initialValues.meetupLocations || []
  );
  const [photoName, setPhotoName] = useState(initialValues.photoName || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialValues.imageUrl || "");

  useEffect(() => {
    if (!photoFile) return undefined;
    let active = true;
    const reader = new FileReader();
    reader.onload = () => { if (active) setPhotoPreview(String(reader.result)); };
    reader.readAsDataURL(photoFile);
    return () => { active = false; };
  }, [photoFile]);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.availableFor.length) {
      setFormNotice("Choose at least one option: Buy or Rent.");
      return;
    }
    const type = form.availableFor.length === 2 ? "both" : form.availableFor[0] === "rent" ? "rent" : "sale";
    const salePrice = form.availableFor.includes("buy") ? Number(form.salePrice) : null;
    const rentalPricePerDay = form.availableFor.includes("rent") ? Number(form.rentalPricePerDay) : null;
    onSubmit({ ...form, type, price: salePrice ?? rentalPricePerDay, salePrice, rentalPricePerDay, stock: Number(form.stock), photoName, imageUrl: photoPreview });
    // FUTURE API CONNECTION: POST /api/products and send the selected photo to image storage.
  };

  return (
    <form className="form-card listing-form" onSubmit={submit}>
      <div className="form-heading">
          <div><p className="eyebrow">YOUR PROFILE</p><h2>{initialValues.id ? "Edit listing" : "Post an item"}</h2></div>
        <button className="quiet-button" type="button" onClick={onCancel}>Cancel</button>
      </div>
      <p className="form-intro">One listing can be available to buy, rent, or both.</p>

      <fieldset className="choice-field">
        <legend>Make this item available for</legend>
        <label className={form.availableFor.includes("buy") ? "choice selected" : "choice"}>
          <input type="checkbox" checked={form.availableFor.includes("buy")} onChange={(event) => { setForm((current) => ({ ...current, availableFor: event.target.checked ? [...new Set([...current.availableFor, "buy"])] : current.availableFor.filter((offer) => offer !== "buy") })); setFormNotice(""); }} />
          Buy
        </label>
        <label className={form.availableFor.includes("rent") ? "choice selected" : "choice"}>
          <input type="checkbox" checked={form.availableFor.includes("rent")} onChange={(event) => { setForm((current) => ({ ...current, availableFor: event.target.checked ? [...new Set([...current.availableFor, "rent"])] : current.availableFor.filter((offer) => offer !== "rent") })); setFormNotice(""); }} />
          Rent
        </label>
      </fieldset>
      {formNotice && <p className="form-notice" role="alert">{formNotice}</p>}

      <label className="field-label">Item name
        <input name="title" value={form.title} onChange={update} required placeholder="e.g. Calculus textbook" />
      </label>
      <div className="form-two-column">
        <label className="field-label">Category
          <select name="category" value={form.category} onChange={update}>
            <option>Books</option><option>Uniforms</option><option>Electronics</option><option>School supplies</option><option>Others</option>
          </select>
        </label>
        <label className="field-label">Condition
          <select name="condition" value={form.condition} onChange={update}>
            <option>New</option><option>Like new</option><option>Good</option><option>Fair</option>
          </select>
        </label>
      </div>
      {form.availableFor.includes("buy") && <label className="field-label">Buy price<span className="price-input"><span>₱</span><input name="salePrice" value={form.salePrice} onChange={update} type="number" min="0" required placeholder="250" /></span></label>}
      {form.availableFor.includes("rent") && <label className="field-label">Rental price per day<span className="price-input"><span>₱</span><input name="rentalPricePerDay" value={form.rentalPricePerDay} onChange={update} type="number" min="0" required placeholder="30" /></span></label>}
      <label className="field-label">Stock available<input name="stock" value={form.stock} onChange={update} type="number" min="1" step="1" required /></label>
      <label className="field-label">Description
        <textarea name="description" value={form.description} onChange={update} rows="4" required placeholder="Add details about the item and where you can meet on campus." />
      </label>
      <div className="field-label">
  <h3>Meetup Locations</h3>
  <p className="field-hint">
    Select 2 to 6 possible meetup locations for your buyers.
  </p>

  <CampusMap onLocationsChange={setMeetupLocations} />
</div>
      <label className="field-label">Photos
        <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0] || null; setPhotoFile(file); setPhotoName(file?.name || ""); }} />
        {photoPreview && <img className="listing-photo-preview" src={photoPreview} alt="Preview of the selected listing" />}
        {photoName && <small className="field-hint">Selected: {photoName} (demo only; not uploaded)</small>}
      </label>
      <button className="button button-primary" type="submit">{initialValues.id ? "Save changes" : "Publish listing"}</button>
      <p className="field-hint">Stock decreases when an order is marked complete. Listings with no stock stop appearing in the marketplace.</p>
    </form>
  );
}
