import { getAuthenticatedUser } from "../../auth/authSession";
function SellerSettingsPage() {
  const seller = getAuthenticatedUser();
  return <section className="seller-page"><h1>Seller Settings</h1>
    <div className="seller-store-profile"><strong>{seller.fullName}</strong>
      <p>{seller.email}</p><p>{seller.phoneNumber}</p>
      <p>Account profile persistence requires backend authentication.</p></div>
  </section>;
}
export default SellerSettingsPage;
