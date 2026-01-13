import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import styles from "./Login.module.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login, accessToken, loading, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) navigate("/", { replace: true });
  }, [accessToken, navigate]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>Loading…</div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://messaging-app-production-8a6f.up.railway.app/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      login(data.accessToken);
      user(data.payload);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>

        <form onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setError("")}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setError("")}
              required
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>
      </div>
      <p className={styles.signupPrompt}>
        Don't have an account yet? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}

export default Login;
