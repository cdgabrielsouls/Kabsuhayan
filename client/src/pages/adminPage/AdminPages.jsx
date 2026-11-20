import { Link, useLocation } from "react-router-dom";
import { Brand } from "../public/PublicPages";

const tabs = [
  ["overview", "Overview"],
  ["students", "Students"],
  ["listings", "Listings"],
  ["reports", "Reports"],
];

const adminModules = [
  ["students", "Student accounts", "Review campus account registrations."],
  ["listings", "Listing moderation", "Check and manage marketplace posts."],
  ["reports", "Student reports", "Review concerns submitted by students."],
];

function AdminIcon({ name }) {
  if (name === "students") return <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8"/></svg>;
  if (name === "listings") return <svg viewBox="0 0 24 24"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v8.5"/></svg>;
  if (name === "reports") return <svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>;
  return <svg viewBox="0 0 24 24"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/></svg>;
}

function EmptyState({ title, message }) {
  return (
    <div className="admin-empty-state">
      <span className="admin-empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}

export default function AdminPages() {
  const location = useLocation();
  const requestedSection = location.pathname.split("/")[2] || "overview";
  const section = tabs.some(([id]) => id === requestedSection) ? requestedSection : "overview";
  const heading = tabs.find(([id]) => id === section)?.[1] || "Overview";

  return (
    <main className="admin-page">
      <header className="admin-header">
        <Brand to="/app/home" />
        <div className="admin-header-actions"><span className="admin-mode-label"><i />Admin workspace</span><Link className="admin-return-link" to="/app/home">Back to marketplace <span aria-hidden="true">↗</span></Link></div>
      </header>

      <div className="admin-layout">
        <nav className="admin-tabs" aria-label="Admin pages">
          <p>MANAGE</p>
          {tabs.map(([id, label]) => (
            <Link key={id} className={id === section ? "active" : ""} to={`/admin/${id}`} aria-current={id === section ? "page" : undefined}>
              <span className="admin-nav-icon" aria-hidden="true"><AdminIcon name={id} /></span>{label}
            </Link>
          ))}
        </nav>

        <section className="admin-content">
          <div className="admin-page-heading"><div><p className="admin-breadcrumb">Admin <span>/</span> {heading}</p><h1>{heading}</h1></div></div>

          {section === "overview" && <>
            <section className="admin-welcome-card">
              <div><p className="eyebrow">KABSUHAYAN · INDANG MAIN CAMPUS</p><h2>Manage your campus marketplace</h2><p>Review student accounts, listings, and reports from one place.</p></div>
              <span className="admin-welcome-mark" aria-hidden="true"><AdminIcon name="overview" /></span>
            </section>
            <div className="admin-module-grid">
              {adminModules.map(([id, title, description]) => <Link className="admin-module-card" to={`/admin/${id}`} key={id}><span className={`admin-module-icon ${id}`}><AdminIcon name={id} /></span><span className="admin-module-copy"><strong>{title}</strong><small>{description}</small></span><span className="admin-module-arrow" aria-hidden="true">↗</span></Link>)}
            </div>
            <section className="admin-panel">
              <div className="admin-panel-heading"><div><h2>Recent activity</h2><p>New activity will show up here.</p></div></div>
              <EmptyState title="No activity yet" message="Student accounts, listings, and reports will appear here once connected." />
            </section>
          </>}

          {section === "students" && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Student accounts</h2><p>Review registered campus accounts.</p></div></div><EmptyState title="No student accounts yet" message="Student accounts will appear here when account registration is connected." /></section>}
          {section === "listings" && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Listing moderation</h2><p>Check items posted to the marketplace.</p></div></div><EmptyState title="No listings to review" message="Listings that need attention will appear here." /></section>}
          {section === "reports" && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Reports</h2><p>Review concerns raised by students.</p></div></div><EmptyState title="No reports yet" message="There are no student reports to review." /></section>}
        </section>
      </div>
    </main>
  );
}
