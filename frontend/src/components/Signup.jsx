import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div>
      <form onSubmit={handleSubmit}>
        {formError && <p style={{ color: "red" }}>{formError}</p>}
        <div>
          <label>Username: </label>
          <input
            type="text"
            value={user.username}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, username: e.target.value }))
            }
          />
          {errors.username && <p style={{ color: "red" }}>{errors.username}</p>}
        </div>
        <div>
          <label>Email: </label>
          <input
            type="email"
            value={user.email}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={user.password}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, password: e.target.value }))
            }
          />
          {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
        </div>
        <div>
          <label>Confirm password: </label>
          <input
            type="password"
            value={user.confirmPassword}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, confirmPassword: e.target.value }))
            }
          />
          {errors.confirmPassword && (
            <p style={{ color: "red" }}>{errors.confirmPassword}</p>
          )}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating" : "Create account"}
        </button>
      </form>
    </div>
  );
}

export default Signup;
