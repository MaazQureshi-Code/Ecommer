import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addSellerProductImage,
  createSellerProduct,
  createSellerVariant,
  getSellerCategories,
  getSellerProductById,
  removeSellerProductImage,
  updateSellerProduct,
  updateSellerProductImage,
  updateSellerProductInfo,
  updateSellerVariant,
} from "../../services/sellerProductService";

const emptyProduct = {
  productName: "", shortDescription: "", description: "", brand: "", modelNumber: "",
  categoryId: "", productCondition: "NEW", conditionDescription: "", status: "DRAFT",
};

function SellerProductEditorPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isNew = !productId;
  const [product, setProduct] = useState(emptyProduct);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [info, setInfo] = useState({});
  const [newImageUrl, setNewImageUrl] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getSellerCategories().then((records) => active && setCategories(records));
    if (!isNew) {
      getSellerProductById(productId)
        .then((record) => {
          if (active) {
            setProduct(record);
            setVariants(record.variants || []);
            setImages(record.images || []);
            setInfo(record.productInfo || {});
          }
        })
        .catch((reason) => active && setError(reason.message));
    }
    return () => { active = false; };
  }, [isNew, productId]);

  const setField = (field, value) => setProduct((current) => ({ ...current, [field]: value }));

  const saveProduct = async (event) => {
    event.preventDefault();
    try {
      setError("");
      const saved = isNew
        ? await createSellerProduct(product)
        : await updateSellerProduct(productId, product);
      setMessage("Product saved.");
      if (isNew) navigate(`/seller/products/${saved.productId}`, { replace: true });
      else setProduct(saved);
    } catch (reason) {
      setError(reason.message);
    }
  };

  const saveVariant = async (variant) => {
    try {
      const saved = variant.variantId
        ? await updateSellerVariant(productId, variant.variantId, variant)
        : await createSellerVariant(productId, variant);
      setVariants((current) =>
        variant.variantId
          ? current.map((record) => record.variantId === saved.variantId ? saved : record)
          : [...current.filter((record) => record.variantId), saved],
      );
      setMessage("Variant saved.");
    } catch (reason) {
      setError(reason.message);
    }
  };

  const addImage = async () => {
    try {
      const image = await addSellerProductImage(productId, {
        imageUrl: newImageUrl,
        altText: product.productName,
        displayOrder: images.length + 1,
        isPrimary: images.length === 0,
      });
      setImages((current) => [...current, image]);
      setNewImageUrl("");
      setMessage("Image added.");
    } catch (reason) {
      setError(reason.message);
    }
  };

  const saveInfo = async () => {
    try {
      setInfo(await updateSellerProductInfo(productId, {
        warrantyInformation: info.warrantyInformation || null,
        returnPolicy: info.returnPolicy || null,
        careInstructions: info.careInstructions || null,
        additionalInformation: info.additionalInformation || null,
      }));
      setMessage("Product information saved.");
    } catch (reason) {
      setError(reason.message);
    }
  };

  const makePrimary = async (imageId) => {
    try {
      await updateSellerProductImage(productId, imageId, { isPrimary: true });
      const refreshed = await getSellerProductById(productId);
      setImages(refreshed.images);
    } catch (reason) {
      setError(reason.message);
    }
  };

  const removeImage = async (imageId) => {
    try {
      await removeSellerProductImage(productId, imageId);
      const refreshed = await getSellerProductById(productId);
      setImages(refreshed.images);
    } catch (reason) {
      setError(reason.message);
    }
  };

  return (
    <section className="seller-page">
      <h1>{isNew ? "Create Product" : "Edit Product"}</h1>
      {error && <div className="admin-page-notice admin-page-notice-error">{error}</div>}
      {message && <div className="admin-page-notice admin-page-notice-success">{message}</div>}
      <form className="seller-form" onSubmit={saveProduct}>
        <label>Product name<input value={product.productName || ""} onChange={(e) => setField("productName", e.target.value)} /></label>
        <label>Category<select value={product.categoryId || ""} onChange={(e) => setField("categoryId", e.target.value)}>
          <option value="">Select category</option>
          {categories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>)}
        </select></label>
        <label>Brand<input value={product.brand || ""} onChange={(e) => setField("brand", e.target.value)} /></label>
        <label>Model number<input value={product.modelNumber || ""} onChange={(e) => setField("modelNumber", e.target.value)} /></label>
        <label>Condition<select value={product.productCondition || "NEW"} onChange={(e) => setField("productCondition", e.target.value)}>
          {["NEW","USED_LIKE_NEW","USED_GOOD","USED_FAIR","REFURBISHED"].map((value) => <option key={value}>{value}</option>)}
        </select></label>
        <label>Status<select value={product.status || "DRAFT"} onChange={(e) => setField("status", e.target.value)}>
          {["DRAFT","ACTIVE","INACTIVE","OUT_OF_STOCK","DELETED"].map((value) => <option key={value}>{value}</option>)}
        </select></label>
        <label className="seller-form-wide">Short description<input value={product.shortDescription || ""} onChange={(e) => setField("shortDescription", e.target.value)} /></label>
        <label className="seller-form-wide">Description<textarea value={product.description || ""} onChange={(e) => setField("description", e.target.value)} /></label>
        <label className="seller-form-wide">Condition description<textarea value={product.conditionDescription || ""} onChange={(e) => setField("conditionDescription", e.target.value)} /></label>
        <button className="admin-create-coupon-button" type="submit">Save Product</button>
      </form>
      {!isNew && (
        <>
        <section className="seller-variants">
          <div className="seller-page-heading"><h2>Variants</h2>
            <button type="button" onClick={() => setVariants((current) => [...current, {
              sku: "", variantName: "", price: 0, costPrice: 0, stockQuantity: 0, status: "ACTIVE",
            }])}>Add Variant</button></div>
          {variants.map((variant, index) => (
            <div className="seller-variant-row" key={variant.variantId || `new-${index}`}>
              {["sku","variantName","price","costPrice","stockQuantity"].map((field) => (
                <input key={field} aria-label={field} placeholder={field} value={variant[field] ?? ""}
                  type={["price","costPrice","stockQuantity"].includes(field) ? "number" : "text"}
                  onChange={(event) => setVariants((current) => current.map((record, recordIndex) =>
                    recordIndex === index ? { ...record, [field]: event.target.value } : record))} />
              ))}
              <select value={variant.status} onChange={(event) => setVariants((current) => current.map((record, recordIndex) =>
                recordIndex === index ? { ...record, status: event.target.value } : record))}>
                {["ACTIVE","INACTIVE","OUT_OF_STOCK","DELETED"].map((status) => <option key={status}>{status}</option>)}
              </select>
              <button type="button" onClick={() => saveVariant(variant)}>Save</button>
              {variant.rowVersion && <code title="Concurrency token">{variant.rowVersion}</code>}
            </div>
          ))}
        </section>
        <section className="seller-variants">
          <h2>Product Images</h2>
          <div className="seller-action-row">
            <input aria-label="Image URL" placeholder="Image URL" value={newImageUrl}
              onChange={(event) => setNewImageUrl(event.target.value)} />
            <button type="button" onClick={addImage}>Add Image URL</button>
          </div>
          <div className="seller-card-list">
            {images.map((image) => (
              <article className="seller-record-card" key={image.imageId}>
                <span>{image.imageUrl}</span>
                <div><span>{image.isPrimary ? "Primary" : `Order ${image.displayOrder}`}</span>
                  {!image.isPrimary && <button type="button" onClick={() => makePrimary(image.imageId)}>Make Primary</button>}
                  <button type="button" onClick={() => removeImage(image.imageId)}>Remove</button></div>
              </article>
            ))}
          </div>
        </section>
        <section className="seller-variants">
          <h2>Product Information</h2>
          <div className="seller-form">
            {["warrantyInformation","returnPolicy","careInstructions","additionalInformation"].map((field) => (
              <label key={field}>{field.replace(/([A-Z])/g, " $1")}
                <textarea value={info[field] || ""} onChange={(event) =>
                  setInfo((current) => ({ ...current, [field]: event.target.value }))} />
              </label>
            ))}
            <button type="button" onClick={saveInfo}>Save Product Information</button>
          </div>
        </section>
        </>
      )}
    </section>
  );
}

export default SellerProductEditorPage;
