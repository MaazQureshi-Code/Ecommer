import { useEffect, useState } from "react";
import {
  getBuyerWishlist,
  moveBuyerWishlistItemToCart,
  removeBuyerWishlistItem,
} from "../../services/buyerWishlistService";

function BuyerWishlistPage() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const load = () => getBuyerWishlist().then(setItems).catch((error) => setMessage(error.message));
  useEffect(load, []);
  const act = async (action) => {
    try { await action(); setMessage(""); load(); } catch (error) { setMessage(error.message); }
  };
  return (
    <div>
      <h1>Wishlist</h1>
      {!items.length && <p>Your wishlist is empty.</p>}
      <div className="buyer-cards">{items.map((item) => (
        <article className="buyer-card" key={item.wishlistItemId}>
          <strong>{item.product?.productName || "Unavailable product"}</strong>
          <button type="button" onClick={() => act(() => moveBuyerWishlistItemToCart(item.wishlistItemId))}>Move to cart</button>
          <button type="button" onClick={() => act(() => removeBuyerWishlistItem(item.wishlistItemId))}>Remove</button>
        </article>
      ))}</div>
      {message && <p>{message}</p>}
    </div>
  );
}
export default BuyerWishlistPage;
