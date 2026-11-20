import { Link, useLocation } from "react-router-dom";

const tabs = [
  ["overview", "Overview"],
  ["students", "Students"],
  ["listings", "Listings"],
  ["reports", "Reports"],
];

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
        <Link className="admin-brand" to="/app/home">
          <span className="admin-brand-mark">K</span>
          <span>Kabsuhayan<small>ADMIN</small></span>
        </Link>
        <Link className="admin-return-link" to="/app/home">Back to marketplace <span aria-hidden="true">↗</span></Link>
      </header>

      <div className="admin-layout">
        <nav className="admin-tabs" aria-label="Admin pages">
          <p>MANAGE</p>
          {tabs.map(([id, label]) => (
            <Link key={id} className={id === section ? "active" : ""} to={`/admin/${id}`} aria-current={id === section ? "page" : undefined}>
              <span className={`admin-nav-dot ${id}`} aria-hidden="true" />{label}
            </Link>
          ))}
        </nav>

        <section className="admin-content">
          <p className="eyebrow">CAMPUS MARKETPLACE</p>
          <h1>{heading}</h1>

          {section === "overview" && <>
            <p className="page-intro">A quick look at what needs attention.</p>
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
