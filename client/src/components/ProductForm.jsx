import { useEffect, useState } from "react";

export default function ProductForm({ onSubmit, onCancel, initialValues = {} }) {
  const [form, setForm] = useState(() => ({
    title: "",
    description: "",
    price: "",
    category: "Books",
    type: "sale",
    condition: "Good",
    ...initialValues,
    price: initialValues.price ?? "",
  }));
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
    onSubmit({ ...form, price: Number(form.price), photoName, imageUrl: photoPreview });
    // FUTURE API CONNECTION: POST /api/products and send the selected photo to image storage.
  };

  return (
    <form className="form-card listing-form" onSubmit={submit}>
      <div className="form-heading">
          <div><p className="eyebrow">YOUR PROFILE</p><h2>{initialValues.id ? "Edit listing" : "Post an item"}</h2></div>
        <button className="quiet-button" type="button" onClick={onCancel}>Cancel</button>
      </div>
      <p className="form-intro">One student account can post items for sale or rent.</p>

      <fieldset className="choice-field">
        <legend>What would you like to do?</legend>
        <label className={form.type === "sale" ? "choice selected" : "choice"}>
          <input type="radio" name="type" value="sale" checked={form.type === "sale"} onChange={update} />
          Sell an item
        </label>
        <label className={form.type === "rent" ? "choice selected" : "choice"}>
          <input type="radio" name="type" value="rent" checked={form.type === "rent"} onChange={update} />
          Rent out an item
        </label>
      </fieldset>

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
      <label className="field-label">{form.type === "rent" ? "Rental price per day" : "Price"}
        <span className="price-input"><span>₱</span><input name="price" value={form.price} onChange={update} type="number" min="0" required placeholder="250" /></span>
      </label>
      <label className="field-label">Description
        <textarea name="description" value={form.description} onChange={update} rows="4" required placeholder="Add details about the item and where you can meet on campus." />
      </label>
      <label className="field-label">Photos
        <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0] || null; setPhotoFile(file); setPhotoName(file?.name || ""); }} />
        {photoPreview && <img className="listing-photo-preview" src={photoPreview} alt="Preview of the selected listing" />}
        {photoName && <small className="field-hint">Selected: {photoName} (demo only; not uploaded)</small>}
      </label>
      <button className="button button-primary" type="submit">{initialValues.id ? "Save changes" : "Publish listing"}</button>
      <p className="field-hint">This preview keeps new listings in page state only. Nothing is saved to MongoDB yet.</p>
    </form>
  );
}
