import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../css/pages/Login.css";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(mode) {
    setAuthMode(mode);
    setError("");
  }

  async function handleSignIn(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      if (data.errorMessage) {
        setError(data.errorMessage);
        return;
      }

      if (data.user) {
        setUser(data.user);
      }

      navigate("/dashboard");
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");

    if (registerPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const trimmedFirstname = firstname.trim();
    const trimmedLastname = lastname.trim();

    if (!trimmedFirstname || !trimmedLastname) {
      setError("First name and last name are required.");
      return;
    }

    const username =
      registerEmail.split("@")[0] ||
      `${trimmedFirstname}${trimmedLastname}`.replace(/\s+/g, "").toLowerCase();

    setLoading(true);

    try {
      const data = await register({
        firstname: trimmedFirstname,
        lastname: trimmedLastname,
        username,
        email: registerEmail,
        password: registerPassword,
      });

      if (data.errorMessage) {
        setError(data.errorMessage);
        return;
      }

      setAuthMode("login");
      setEmail(registerEmail);
      setPassword("");
      setFirstname("");
      setLastname("");
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <main className="login-main">
        <div className="login-branding">
          <div className="branding-content">
            <div className="branding-text-group">
              <h1 className="branding-title">DUMAN</h1>
              <p className="branding-subtitle">
                Digital University Meeting Arrangement Node
              </p>
              <p className="branding-tagline">Connect. Schedule. Meet.</p>
              <p className="branding-description">
                DUMAN makes campus collaboration effortless for ADNU students and
                staff. Sign in to sync your shared calendars, find the perfect
                meeting spot on campus, and keep your team on the same page.
              </p>
            </div>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="auth-box">
            <div className="auth-toggle">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`toggle-btn ${authMode === "login" ? "active" : ""}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`toggle-btn ${authMode === "register" ? "active" : ""}`}
              >
                Register
              </button>
            </div>

            <div className="auth-card">
              {error && <p className="auth-error">{error}</p>}

              {authMode === "login" ? (
                <form className="auth-form" onSubmit={handleSignIn}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      University Email
                    </label>
                    <input
                      className="form-input"
                      id="email"
                      type="email"
                      placeholder="name@gbox.adnu.edu.ph"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="password">
                      Password
                    </label>
                    <input
                      className="form-input"
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>

                  <div className="action-group">
                    <button className="btn-primary" type="submit" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </button>
                  </div>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleRegister}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-firstname">
                      First Name
                    </label>
                    <input
                      className="form-input"
                      id="reg-firstname"
                      type="text"
                      placeholder="Juan"
                      value={firstname}
                      onChange={(event) => setFirstname(event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-lastname">
                      Last Name
                    </label>
                    <input
                      className="form-input"
                      id="reg-lastname"
                      type="text"
                      placeholder="Guerrero"
                      value={lastname}
                      onChange={(event) => setLastname(event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-email">
                      University Email
                    </label>
                    <input
                      className="form-input"
                      id="reg-email"
                      type="email"
                      placeholder="name@gbox.adnu.edu.ph"
                      value={registerEmail}
                      onChange={(event) => setRegisterEmail(event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-pass">
                      Password
                    </label>
                    <input
                      className="form-input"
                      id="reg-pass"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(event) => setRegisterPassword(event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-confirm-pass">
                      Confirm Password
                    </label>
                    <input
                      className="form-input"
                      id="reg-confirm-pass"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                    />
                  </div>

                  <div className="action-group">
                    <button className="btn-primary" type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Account"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
