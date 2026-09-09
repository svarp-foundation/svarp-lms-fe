import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../lib/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const resolveRole = (decoded) => {
    if (decoded?.role) return decoded.role;
    if (decoded?.roles?.includes("admin")) return "admin";
    if (decoded?.roles?.includes("instructor") || decoded?.roles?.includes("teacher"))
      return "instructor";
    if (decoded?.roles?.includes("instructor_pending")) return "instructor_pending";
    return "learner";
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me");
      if (res.data) {
        setUser((prev) => ({
          ...(prev || {}),
          ...res.data,
          role: res.data.role || prev?.role || "learner",
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
    return null;
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const refresh = localStorage.getItem("refreshToken");

      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            if (!refresh) logout();
          } else {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            const baseRole = resolveRole(decoded);
            setUser({ ...decoded, role: baseRole });

            // Fetch live profile from LMS database to get updated role
            try {
              const res = await api.get("/users/me");
              if (res.data) {
                setUser({
                  ...decoded,
                  ...res.data,
                  role: res.data.role || baseRole,
                });
              }
            } catch (e) {
              console.warn("Could not sync live profile on init:", e);
            }
          }
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

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
            const userRole = resolveRole(decoded);
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
      }
    );

    return () => {
      api.interceptors.response.eject(interceptorConfig);
    };
  }, []);

  const login = async (token, refreshToken = null, initialUser = null) => {
    localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

    const decoded = jwtDecode(token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    let effectiveRole = initialUser?.role || resolveRole(decoded);
    let finalUser = {
      ...decoded,
      ...(initialUser || {}),
      role: effectiveRole,
    };

    setUser(finalUser);

    // If initialUser was not passed, fetch profile from /users/me
    if (!initialUser) {
      try {
        const res = await api.get("/users/me");
        if (res.data) {
          effectiveRole = res.data.role || effectiveRole;
          finalUser = {
            ...finalUser,
            ...res.data,
            role: effectiveRole,
          };
          setUser(finalUser);
        }
      } catch (err) {
        console.error("Error fetching profile on login:", err);
      }
    }

    return finalUser;
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
    fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
