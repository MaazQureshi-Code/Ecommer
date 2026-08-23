import { useEffect, useState } from "react";
import {
  createBuyerAddress,
  getBuyerAddresses,
  removeBuyerAddress,
  updateBuyerAddress,
} from "../../services/buyerAddressService";

const empty = {
  recipientName: "", recipientPhone: "", streetAddress: "", city: "",
  stateProvince: "", postalCode: "", country: "",
};

function BuyerAddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const load = () => getBuyerAddresses().then(setAddresses).catch((error) => setMessage(error.message));
  useEffect(load, []);
  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) await updateBuyerAddress(editingId, form);
      else await createBuyerAddress(form);
      setForm(empty); setEditingId(null); setMessage(""); load();
    } catch (error) { setMessage(error.message); }
  };
  const edit = (address) => {
    setEditingId(address.buyerAddressId);
    setForm(Object.fromEntries(Object.keys(empty).map((key) => [key, address[key] || ""])));
  };
  const remove = async (id) => { await removeBuyerAddress(id); load(); };
  return (
    <div>
      <h1>Saved addresses</h1>
      <div className="buyer-cards">
        {addresses.map((address) => (
          <article key={address.buyerAddressId} className="buyer-card">
            <strong>{address.recipientName}</strong>
            <p>{address.streetAddress}, {address.city}, {address.stateProvince} {address.postalCode}, {address.country}</p>
            <p>{address.recipientPhone}</p>
            <button type="button" onClick={() => edit(address)}>Edit</button>
            <button type="button" onClick={() => remove(address.buyerAddressId)}>Remove</button>
          </article>
        ))}
      </div>
      <h2>{editingId ? "Edit address" : "Add address"}</h2>
      <form className="buyer-form" onSubmit={submit}>
        {Object.keys(empty).map((key) => (
          <label key={key}>{key.replace(/([A-Z])/g, " $1")}
            <input value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
          </label>
        ))}
        <button type="submit">{editingId ? "Update" : "Add"} address</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
export default BuyerAddressesPage;
