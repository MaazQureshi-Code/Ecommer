import { useEffect, useState } from "react";
import { getBuyerProfile, updateBuyerProfile } from "../../services/buyerAccountService";

function BuyerProfilePage() {
  const [form, setForm] = useState({ fullName: "", email: "", phoneNumber: "" });
  const [message, setMessage] = useState("");
  useEffect(() => {
    getBuyerProfile().then(setForm).catch((error) => setMessage(error.message));
  }, []);
  const submit = async (event) => {
    event.preventDefault();
    try {
      setForm(await updateBuyerProfile(form));
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  return (
    <div>
      <h1>Profile</h1>
      <form className="buyer-form" onSubmit={submit}>
        <label>Full name<input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label>
        <label>Email<input value={form.email} disabled /></label>
        <label>Phone<input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} /></label>
        <button type="submit">Save profile</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
export default BuyerProfilePage;
