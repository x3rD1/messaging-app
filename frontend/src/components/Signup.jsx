import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

function Signup() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          email: user.email,
          password: user.password,
          confirmPassword: user.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const fieldErrors = {};
        if (data.errors) {
          data.errors.forEach((err) => {
            if (!fieldErrors[err.path]) fieldErrors[err.path] = err.msg;
          });
          setErrors(fieldErrors);
          setLoading(false);
        }
        throw new Error(data.message);
      }
      setLoading(false);
      if (!data.errors) navigate("/login");
    } catch (err) {
      console.log(err);
      setFormError(err.message);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create your account</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {formError && <p className={styles.error}>{formError}</p>}

          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input
              type="text"
              value={user.username}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, username: e.target.value }))
              }
              className={styles.input}
            />
            {errors.username && (
              <p className={styles.error}>{errors.username}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, email: e.target.value }))
              }
              className={styles.input}
            />
            {errors.email && <p className={styles.error}>{errors.email}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={user.password}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, password: e.target.value }))
              }
              className={styles.input}
            />
            {errors.password && (
              <p className={styles.error}>{errors.password}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm password</label>
            <input
              type="password"
              value={user.confirmPassword}
              onChange={(e) =>
                setUser((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className={styles.input}
            />
            {errors.confirmPassword && (
              <p className={styles.error}>{errors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className={styles.loginPrompt}>
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
