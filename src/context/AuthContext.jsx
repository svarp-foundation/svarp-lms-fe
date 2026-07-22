import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../lib/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      // If profile fetch fails, we still have the decoded JWT user (sub, role etc)
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const refresh = localStorage.getItem("refreshToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          if (!refresh) logout();
        } else {
          const userRole = decoded.role || (decoded.roles?.includes("admin") ? "admin" : "learner");
          setUser({ ...decoded, role: userRole });
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          fetchProfile(); // Get full profile with membership
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);

    // Set up Global Axios Interceptor
    const interceptorConfig = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== "/refresh" &&
          !originalRequest.url.startsWith("/public")
        ) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) throw new Error("No refresh token");

            // Refresh
            const rs = await api.post("/refresh", {
              refresh_token: refreshToken,
            });

            const newToken = rs.data.access_token;
            const newRefresh = rs.data.refresh_token;

            localStorage.setItem("token", newToken);
            localStorage.setItem("refreshToken", newRefresh);

            api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            const decoded = jwtDecode(newToken);
            const userRole = decoded.role || (decoded.roles?.includes("admin") ? "admin" : "learner");
            setUser({ ...decoded, role: userRole });
            fetchProfile(); // Refresh profile after token refresh

            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (e) {
            logout();
            return Promise.reject(e);
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(interceptorConfig);
    };
  }, []);

  const login = (token, refreshToken = null) => {
    localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

    const decoded = jwtDecode(token);
    const userRole = decoded.role || (decoded.roles?.includes("admin") ? "admin" : "learner");
    setUser({ ...decoded, role: userRole });
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    fetchProfile(); // Fetch profile on login
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  const getToken = () => localStorage.getItem("token");

  const value = {
    user,
    login,
    logout,
    loading,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
