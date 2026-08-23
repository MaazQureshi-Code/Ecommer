import { requireAuthenticatedBuyer } from "../auth/authSession";
import { operationalUserAccounts } from "../data/operationalAccountStore";

export const getBuyerProfile = async () => structuredClone(requireAuthenticatedBuyer());

export const updateBuyerProfile = async (values) => {
  const buyer = requireAuthenticatedBuyer();
  const account = operationalUserAccounts.find(
    (record) => Number(record.userId) === Number(buyer.userId),
  );
  const fullName = String(values.fullName || "").trim();
  const phoneNumber = String(values.phoneNumber || "").trim();
  if (!fullName || !phoneNumber) throw new Error("Name and phone are required.");
  account.fullName = fullName;
  account.phoneNumber = phoneNumber;
  return {
    userId: account.userId,
    fullName: account.fullName,
    email: account.email,
    phoneNumber: account.phoneNumber,
    registrationDate: account.registrationDate,
    role: account.role,
    accountStatus: account.accountStatus,
    permissionLevel: account.permissionLevel,
  };
};
