import { api } from "./apiClient.js";
import { clearAuthenticatedSession, setAuthenticatedSession } from "../auth/authSession.js";

export const login = async ({ email, password }) => {
  const response = await api.post("/api/Auth/login", { email, password }, { token: null });
  return setAuthenticatedSession(response);
};

export const logout = () => clearAuthenticatedSession();
