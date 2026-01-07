import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";

function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      try {
        const res = await fetch("http://localhost:3000/auth/token/refresh", {
          method: "POST",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          setAccessToken(null);
          setLoading(false);
          return;
        }

        if (data.accessToken) {
          setAccessToken(data.accessToken);
        }
      } catch (err) {
        console.error("Session restore failed:", err);
      } finally {
        setLoading(false);
      }
    }

    restore();
  }, []);

  const login = (token) => setAccessToken(token);
  const logout = () => setAccessToken(null);

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
