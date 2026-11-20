
import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <h2>Kabsuhayan</h2>

        <div className="landing-nav-links">
          <Link to="/login">Log In</Link>
        
        </div>
      </nav>

      <main className="landing-hero">
        <div className="landing-content">
          <p className="landing-tag">YOUR CAMPUS MARKETPLACE</p>

          <h1>
            Buy, Sell, and Connect
            <span> with Your CvSU Community.</span>
          </h1>

          <p className="landing-description">
            Discover affordable finds, sell items you no longer need,
            and connect with fellow CvSU students through Kabsuhayan.
          </p>

          <div className="landing-buttons">
            <Link to="/app/marketplace" className="landing-primary">
              Explore Marketplace →
            </Link>

           
          </div>

          <p className="landing-note">
            Made for students, by students.
          </p>
        </div>

        <div className="landing-visual">
          <div className="landing-circle">
            <span>🛍️</span>
          </div>

          <div className="landing-floating-card">
            <span>💚</span>
            <div>
              <strong>Shop Local</strong>
              <p>Support fellow students</p>
            </div>
          </div>
        </div>
      </main>

      <section className="landing-features">
        <div>
          <span>🔍</span>
          <h3>Discover</h3>
          <p>Find items that fit your needs and budget.</p>
        </div>

        <div>
          <span>🛒</span>
          <h3>Buy & Sell</h3>
          <p>Give items a new home within the campus community.</p>
        </div>

        <div>
          <span>💬</span>
          <h3>Connect</h3>
          <p>Chat and arrange meetups with fellow students.</p>
        </div>
      </section>

      <footer className="landing-footer">
        © 2026 Kabsuhayan. A marketplace for the CvSU community.
      </footer>
    </div>
  );
}
