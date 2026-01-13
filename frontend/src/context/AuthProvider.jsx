import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";

function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      try {
        const res = await fetch(
          "https://messaging-app-production-8a6f.up.railway.app/auth/token/refresh",
          {
            method: "POST",
            credentials: "include",
          }
        );

        const data = await res.json();
        if (!res.ok) {
          setAccessToken(null);
          setLoading(false);
          setUserInfo({});
          return;
        }

        if (data.accessToken) {
          setAccessToken(data.accessToken);
        }
        setUserInfo(data.userPayload);
        setLoading(false);
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
  const user = (payload) => setUserInfo(payload);

  return (
    <AuthContext.Provider
      value={{ accessToken, login, logout, loading, userInfo, user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
