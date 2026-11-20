import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginAccount, registerAccount } from "../../services/api";

export function Brand({ to = "/" }) {
  return <Link className="wordmark" to={to}><span className="wordmark-dot">K</span><span>Kabsu<b>Hayan</b><small>Indang Main Campus</small></span></Link>;
}

function accountFields(form) {
  return {
    name: form.get("name"),
    studentNumber: form.get("studentNumber"),
    email: form.get("email"),
    password: String(form.get("password") || ""),
  };
}

async function submitAccount(mode, form) {
  const account = accountFields(form);
  if (mode === "register" && !/^[^\s@]+@cvsu\.edu\.ph$/i.test(String(account.email || "").trim())) {
    throw new Error("Use a CvSU email address to register (for example, name@cvsu.edu.ph).");
  }
  if (mode === "register" && account.password !== form.get("confirmPassword")) {
    throw new Error("Your passwords do not match.");
  }
  return mode === "register"
    ? registerAccount(account)
    : loginAccount({ email: account.email, password: account.password });
}

function AuthPage({ mode, title, intro }) {
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/app/marketplace";

  const submit = async (event) => {
    event.preventDefault();
    setNotice("");
    if (mode === "forgot" || mode === "verify") {
      setNotice("Email verification and password reset are not available yet.");
      return;
    }
    setSubmitting(true);
    try {
      await submitAccount(mode, new FormData(event.currentTarget));
      navigate(next, { replace: true });
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="auth-page"><div className="auth-top"><Brand /></div><section className="auth-panel"><p className="eyebrow">CvSU STUDENT ACCOUNT</p><h1>{title}</h1><p className="auth-intro">{intro}</p><form className="app-form" onSubmit={submit}>
    {mode === "register" && <><label>Full name<input name="name" required minLength="2" maxLength="100" placeholder="Your full name" /></label><label>Student number<input name="studentNumber" required placeholder="e.g. 2024-12345" /></label></>}
    {mode === "verify" ? <label>Verification code<input inputMode="numeric" required placeholder="Enter the code from your email" /></label> : <label>CvSU email<input name="email" type="email" required placeholder="name@cvsu.edu.ph" /></label>}
    {!['verify', 'forgot'].includes(mode) && <label>Password<input name="password" type="password" required minLength="8" placeholder="At least 8 characters" /></label>}
    {mode === "register" && <label>Confirm password<input name="confirmPassword" type="password" required minLength="8" placeholder="Enter your password again" /></label>}
    {mode === "login" && <div className="form-inline"><label><input type="checkbox" /> Remember me</label><Link to="/forgot-password">Forgot password?</Link></div>}
    <button className="button button-primary form-button" disabled={submitting}>{submitting ? "Please wait…" : mode === "login" ? "Log in" : mode === "register" ? "Create account" : mode === "verify" ? "Verify email" : "Send reset link"}</button>
  </form>{notice && <p className="form-notice" role="alert">{notice}</p>}
  <p className="auth-switch">{mode === "login" ? "New here?" : "Already have an account?"} <Link to={mode === "login" ? `/register?next=${encodeURIComponent(next)}` : `/login?next=${encodeURIComponent(next)}`}>{mode === "login" ? "Create an account" : "Log in"}</Link></p>
  </section><p className="auth-footer">Your account can buy, sell, and rent items.</p></main>;
}

export function LoginPage() { return <AuthPage mode="login" title="Welcome back" intro="Log in with your CvSU student account." />; }
export function RegisterPage() { return <AuthPage mode="register" title="Create your account" intro="Use one account to browse, sell, or rent items." />; }
export function VerifyEmailPage() { return <AuthPage mode="verify" title="Check your email" intro="Email verification is not available yet." />; }
export function ForgotPasswordPage() { return <AuthPage mode="forgot" title="Reset your password" intro="Password reset is not available yet." />; }

export function AuthDialog({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setNotice("");
    setSubmitting(true);
    try {
      const account = await submitAccount(mode, new FormData(event.currentTarget));
      onSuccess(account);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "login" ? "Log in to continue" : "Create your account";
  const intro = mode === "login" ? "Sign in to save items, message sellers, or post a listing." : "One student account works for buying, selling, and renting.";

  return <div className="auth-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title">
      <button className="auth-modal-close" type="button" aria-label="Close sign in dialog" onClick={onClose}>×</button>
      <p className="eyebrow">CvSU STUDENT ACCOUNT</p><h1 id="auth-dialog-title">{title}</h1><p className="auth-intro">{intro}</p>
      <form className="app-form" onSubmit={submit}>
        {mode === "register" && <><label>Full name<input name="name" required minLength="2" maxLength="100" placeholder="Your full name" /></label><label>Student number<input name="studentNumber" required placeholder="e.g. 2024-12345" /></label></>}
        <label>CvSU email<input name="email" type="email" required placeholder="name@cvsu.edu.ph" /></label>
        <label>Password<input name="password" type="password" required minLength="8" placeholder="At least 8 characters" /></label>
        {mode === "register" && <label>Confirm password<input name="confirmPassword" type="password" required minLength="8" placeholder="Enter your password again" /></label>}
        <button className="button button-primary form-button" disabled={submitting}>{submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
      </form>
      {notice && <p className="form-notice" role="alert">{notice}</p>}
      <p className="auth-switch">{mode === "login" ? "New here?" : "Already have an account?"} <button type="button" className="auth-mode-link" onClick={() => { setNotice(""); setMode(mode === "login" ? "register" : "login"); }}>{mode === "login" ? "Create an account" : "Log in"}</button></p>
      <p className="auth-footer">Your account can buy, sell, and rent items.</p>
    </section>
  </div>;
}

export function InlineLoginPage({ nextPath, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setNotice("");
    setSubmitting(true);
    try {
      const account = await submitAccount(mode, new FormData(event.currentTarget));
      onSuccess(account);
      navigate(nextPath, { replace: true });
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "login" ? "Log in to view your profile" : "Create your account";
  const intro = mode === "login" ? "Sign in to see your listings, favorites, and account settings." : "Create one student account for buying, selling, and renting.";

  return <section className="auth-inline"><div className="auth-panel"><p className="eyebrow">CvSU STUDENT ACCOUNT</p><h1>{title}</h1><p className="auth-intro">{intro}</p><form className="app-form" onSubmit={submit}>
    {mode === "register" && <><label>Full name<input name="name" required minLength="2" maxLength="100" placeholder="Your full name" /></label><label>Student number<input name="studentNumber" required placeholder="e.g. 2024-12345" /></label></>}
    <label>CvSU email<input name="email" type="email" required placeholder="name@cvsu.edu.ph" /></label>
    <label>Password<input name="password" type="password" required minLength="8" placeholder="At least 8 characters" /></label>
    {mode === "register" && <label>Confirm password<input name="confirmPassword" type="password" required minLength="8" placeholder="Enter your password again" /></label>}
    <button className="button button-primary form-button" disabled={submitting}>{submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
  </form>{notice && <p className="form-notice" role="alert">{notice}</p>}
  <p className="auth-switch">{mode === "login" ? "New here?" : "Already have an account?"} <button type="button" className="auth-mode-link" onClick={() => { setNotice(""); setMode(mode === "login" ? "register" : "login"); }}>{mode === "login" ? "Create an account" : "Log in"}</button></p>
  <p className="auth-footer">Your profile stays inside the marketplace.</p></div></section>;
}
