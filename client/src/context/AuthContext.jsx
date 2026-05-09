import { createContext, useContext, useState, useEffect } from "react";
import API from "api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load from localStorage + verify from backend
  const loadAdmin = async () => {
    try {
      const stored = localStorage.getItem("adminInfo");

      if (stored) {
        setAdmin(JSON.parse(stored));
      }

      // verify with backend (cookie auth)
      const { data } = await API.get("/admin/profile");

      setAdmin(data);
      localStorage.setItem("adminInfo", JSON.stringify(data));

    } catch (error) {
      setAdmin(null);
      localStorage.removeItem("adminInfo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, []);

  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted && !localStorage.getItem("adminInfo")) {
        window.location.replace("/login");
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // ✅ Logout function
  const logout = async () => {
    try {
      await API.post("/admin/logout");
    } catch (err) {}

    setAdmin(null);
    localStorage.removeItem("adminInfo");
    localStorage.removeItem("token");
    window.history.replaceState(null, "", "/login");
    window.location.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ admin, setAdmin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => useContext(AuthContext);
