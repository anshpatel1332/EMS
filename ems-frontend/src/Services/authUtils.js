import API from "./Api";

/**
 * Get the current logged-in user by verifying the JWT cookie.
 * Returns the user object or null if not authenticated.
 */
export const getCurrentUser = async () => {
  try {
    const response = await API.get("/auth/me");
    return response.data.user;
  } catch {
    return null;
  }
};

/**
 * Log out by clearing the JWT cookie on the server.
 */
export const logout = async (navigate) => {
  try {
    await API.post("/auth/logout");
  } catch {
    // ignore errors
  } finally {
    localStorage.removeItem("user"); // clean up legacy storage
    navigate("/");
  }
};
