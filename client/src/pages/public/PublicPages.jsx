import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

function Brand() {
  return <Link className="wordmark" to="/"><span className="wordmark-dot">K</span><span>Kabsu<b>Hayán</b><small>Indang Main Campus</small></span></Link>;
}

function AuthPage({ mode, title, intro }) {
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/";
  const submit = (event) => {
    event.preventDefault();
    // FUTURE API CONNECTION: replace this demo flow with the matching /api/auth endpoint.
    if (mode === "register") {
      navigate(`/verify-email?next=${encodeURIComponent(next)}`);
      return;
    }
    if (mode === "login" || mode === "verify") {
      sessionStorage.setItem("kabsuhayan-demo-user", "yes");
      navigate(next);
      return;
    }
    setNotice("Password reset email is not connected in this preview.");
  };

  return <main className="auth-page"><div className="auth-top"><Brand /><Link to="/">Back to Marketplace</Link></div><section className="auth-panel"><p className="eyebrow">CvSU STUDENT ACCOUNT</p><h1>{title}</h1><p className="auth-intro">{intro}</p><form className="app-form" onSubmit={submit}>
    {mode === "register" && <><label>Full name<input required placeholder="Your full name" /></label><label>Student number<input required placeholder="e.g. 2024-12345" /></label></>}
    {mode === "verify" ? <label>Verification code<input inputMode="numeric" required placeholder="Enter the code from your email" /></label> : <label>CvSU email<input type="email" required placeholder="name@cvsu.edu.ph" /></label>}
    {!["verify", "forgot"].includes(mode) && <label>Password<input type="password" required minLength="8" placeholder="At least 8 characters" /></label>}
    {mode === "register" && <label>Confirm password<input type="password" required minLength="8" placeholder="Enter your password again" /></label>}
    {mode === "login" && <div className="form-inline"><label><input type="checkbox" /> Remember me</label><Link to="/forgot-password">Forgot password?</Link></div>}
    <button className="button button-primary form-button">{mode === "login" ? "Log in" : mode === "register" ? "Create account" : mode === "verify" ? "Verify email" : "Send reset link"}</button>
  </form>{notice && <p className="form-notice">{notice}</p>}{mode === "verify" && <button className="plain-button" onClick={() => setNotice("Resend email will be enabled after the email service is connected.")}>Resend code</button>}
  <p className="auth-switch">{mode === "login" ? "New here?" : "Already have an account?"} <Link to={mode === "login" ? `/register?next=${encodeURIComponent(next)}` : `/login?next=${encodeURIComponent(next)}`}>{mode === "login" ? "Create an account" : "Log in"}</Link></p>
  </section><p className="auth-footer">Your account can buy, sell, and rent items.</p></main>;
}

export function LoginPage() { return <AuthPage mode="login" title="Welcome back" intro="Log in with your CvSU student account." />; }
export function RegisterPage() { return <AuthPage mode="register" title="Create your account" intro="Use one account to browse, sell, or rent items." />; }
export function VerifyEmailPage() { return <AuthPage mode="verify" title="Check your email" intro="Enter the verification code sent to your CvSU email." />; }
export function ForgotPasswordPage() { return <AuthPage mode="forgot" title="Reset your password" intro="Enter your student email and we’ll send reset instructions." />; }

export function AuthDialog({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (mode === "register") {
      setMode("verify");
      return;
    }
    // FUTURE API CONNECTION: replace this preview completion with login/register verification.
    onSuccess();
  };

  const title = mode === "login" ? "Log in to continue" : mode === "register" ? "Create your account" : "Verify your CvSU email";
  const intro = mode === "login" ? "Sign in to save items, message sellers, or post a listing." : mode === "register" ? "One student account works for buying, selling, and renting." : `Enter the verification code sent to ${email || "your CvSU email"}.`;

  return <div className="auth-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title">
      <button className="auth-modal-close" type="button" aria-label="Close sign in dialog" onClick={onClose}>×</button>
      <p className="eyebrow">CvSU STUDENT ACCOUNT</p><h1 id="auth-dialog-title">{title}</h1><p className="auth-intro">{intro}</p>
      <form className="app-form" onSubmit={submit}>
        {mode === "register" && <><label>Full name<input required placeholder="Your full name" /></label><label>Student number<input required placeholder="e.g. 2024-12345" /></label></>}
        {mode === "verify" ? <label>Verification code<input inputMode="numeric" required placeholder="Enter the code from your email" /></label> : <label>CvSU email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@cvsu.edu.ph" /></label>}
        {mode !== "verify" && <label>Password<input type="password" required minLength="8" placeholder="At least 8 characters" /></label>}
        {mode === "register" && <label>Confirm password<input type="password" required minLength="8" placeholder="Enter your password again" /></label>}
        <button className="button button-primary form-button">{mode === "login" ? "Log in" : mode === "register" ? "Continue to email verification" : "Verify and continue"}</button>
      </form>
      {mode !== "verify" ? <p className="auth-switch">{mode === "login" ? "New here?" : "Already have an account?"} <button type="button" className="auth-mode-link" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create an account" : "Log in"}</button></p> : <button className="plain-button" type="button" onClick={() => setMode("register")}>Back to registration</button>}
      <p className="auth-footer">Your account can buy, sell, and rent items.</p>
    </section>
  </div>;
}

export function InlineLoginPage({ nextPath, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const submit = (event) => {
    event.preventDefault();
    if (mode === "register") {
      setMode("verify");
      return;
    }
    // FUTURE API CONNECTION: authenticate or verify the student before allowing profile access.
    onSuccess();
    navigate(nextPath);
  };

  const title = mode === "login" ? "Log in to view your profile" : mode === "register" ? "Create your account" : "Verify your CvSU email";
  const intro = mode === "login" ? "Sign in to see your listings, favorites, and account settings." : mode === "register" ? "Create one student account for buying, selling, and renting." : `Enter the verification code sent to ${email || "your CvSU email"}.`;

  return <section className="auth-inline"><div className="auth-panel"><p className="eyebrow">CvSU STUDENT ACCOUNT</p><h1>{title}</h1><p className="auth-intro">{intro}</p><form className="app-form" onSubmit={submit}>
    {mode === "register" && <><label>Full name<input required placeholder="Your full name" /></label><label>Student number<input required placeholder="e.g. 2024-12345" /></label></>}
    {mode === "verify" ? <label>Verification code<input inputMode="numeric" required placeholder="Enter the code from your email" /></label> : <label>CvSU email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@cvsu.edu.ph" /></label>}
    {mode !== "verify" && <label>Password<input type="password" required minLength="8" placeholder="At least 8 characters" /></label>}
    {mode === "register" && <label>Confirm password<input type="password" required minLength="8" placeholder="Enter your password again" /></label>}
    <button className="button button-primary form-button">{mode === "login" ? "Log in" : mode === "register" ? "Continue to email verification" : "Verify and continue"}</button>
  </form>{mode !== "verify" ? <p className="auth-switch">{mode === "login" ? "New here?" : "Already have an account?"} <button type="button" className="auth-mode-link" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create an account" : "Log in"}</button></p> : <button className="plain-button" type="button" onClick={() => setMode("register")}>Back to registration</button>}
  <p className="auth-footer">Your profile stays inside the marketplace.</p></div></section>;
}
