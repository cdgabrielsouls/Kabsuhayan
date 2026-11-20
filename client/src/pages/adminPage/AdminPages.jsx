import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Brand } from "../public/PublicPages";
import { deleteAdminUser, getAdminListings, getAdminReports, getAdminSummary, getAdminUsers, getNotifications, reviewAdminListing, reviewAdminReport, updateAdminUserRole, updateAdminUserStatus } from "../../services/api";

const tabs = [
  ["overview", "Overview"],
  ["students", "Students"],
  ["listings", "Listings"],
  ["reports", "Reports"],
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

function ListingModeration() {
  const [status, setStatus] = useState("pending");
  const [listings, setListings] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  const loadListings = () => {
    setLoading(true);
    getAdminListings(status)
      .then(setListings)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadListings();
  }, [status]);

  const review = async (listing, moderationStatus) => {
    setSavingId(listing._id);
    setError("");
    try {
      await reviewAdminListing(listing._id, moderationStatus, notes[listing._id] || "");
      setListings((current) => current.filter((item) => item._id !== listing._id));
      setNotes((current) => ({ ...current, [listing._id]: "" }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId("");
    }
  };

  return <section className="admin-panel">
    <div className="admin-panel-heading">
      <div><h2>Listing moderation</h2><p>Approve a listing before it appears in the marketplace.</p></div>
      <select aria-label="Filter listing review status" value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
      </select>
    </div>
    {error && <p className="form-notice" role="alert">{error}</p>}
    {loading ? <div className="admin-empty-state"><p>Loading listings…</p></div> : !listings.length ? <EmptyState title={status === "pending" ? "No listings to review" : `No ${status} listings`} message={status === "pending" ? "New posts will appear here for admin approval." : `There are no ${status} listings right now.`} /> :
      <div className="admin-review-list">{listings.map((listing) => <article className="admin-review-card" key={listing._id}>
        <div className="admin-review-photo">{listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} /> : <span aria-hidden="true">□</span>}</div>
        <div className="admin-review-details">
          <div className="admin-review-topline"><span className={`admin-review-status ${listing.moderationStatus}`}>{listing.moderationStatus}</span><small>{new Date(listing.createdAt).toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" })}</small></div>
          <h3>{listing.title}</h3>
          <p className="admin-review-meta">{listing.category} · {listing.condition} · {listing.sellerName}</p>
          <strong>₱{Number(listing.price).toLocaleString("en-PH")}{listing.type === "rent" ? " / day" : ""}</strong>
          <p className="admin-review-description">{listing.description}</p>
          {listing.meetupLocations?.length > 0 && <p className="admin-review-meta">Meet-up: {listing.meetupLocations.map((place) => place.name).filter(Boolean).join(", ") || "Locations added"}</p>}
          {status === "pending" && <>
            <label className="admin-review-note">Rejection note (optional)
              <input value={notes[listing._id] || ""} maxLength={500} onChange={(event) => setNotes((current) => ({ ...current, [listing._id]: event.target.value }))} placeholder="Tell the seller what needs to be changed" />
            </label>
            <div className="admin-review-actions">
              <button type="button" className="button button-primary" disabled={savingId === listing._id} onClick={() => review(listing, "approved")}>{savingId === listing._id ? "Saving…" : "Approve listing"}</button>
              <button type="button" className="button button-secondary" disabled={savingId === listing._id} onClick={() => review(listing, "rejected")}>Reject</button>
            </div>
          </>}
          {status === "rejected" && listing.moderationNote && <p className="admin-review-meta">Reason: {listing.moderationNote}</p>}
        </div>
      </article>)}</div>}
  </section>;
}

function AdminOverview() {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    Promise.all([getAdminSummary(), getNotifications()])
      .then(([overview, notifications]) => { setSummary(overview); setActivity(notifications.slice(0, 6)); })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const metrics = summary ? [
    ["Student accounts", summary.totalStudents, "/admin/students", "students"],
    ["Pending listings", summary.pendingListings, "/admin/listings", "listings"],
    ["Open reports", summary.openReports, "/admin/reports", "reports"],
    ["Approved listings", summary.approvedListings, "/admin/listings", "overview"],
  ] : [];

  return <>
    {error && <p className="form-notice" role="alert">{error}</p>}
    {loading ? <div className="admin-empty-state"><p>Loading dashboard…</p></div> : summary && <>
      <div className="admin-stats-grid">{metrics.map(([label, value, to, icon]) => <Link className="admin-stat-card" to={to} key={label}><span className={`admin-module-icon ${icon}`}><AdminIcon name={icon} /></span><span><small>{label}</small><strong>{value}</strong></span><span className="admin-module-arrow" aria-hidden="true">↗</span></Link>)}</div>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h2>Recent activity</h2><p>New listings and student updates.</p></div><button type="button" className="admin-refresh-button" onClick={() => { setLoading(true); setRefreshKey((key) => key + 1); }}>Refresh</button></div>
        {activity.length ? <div className="admin-activity-list">{activity.map((item) => <Link className="admin-activity-item" key={item._id} to={item.link || "/admin/listings"}><span className="admin-activity-dot" /><span><strong>{item.title}</strong><small>{item.message}</small></span><time>{new Date(item.createdAt).toLocaleDateString("en-PH", { day: "numeric", month: "short" })}</time></Link>)}</div> : <EmptyState title="No activity yet" message="Listing submissions and reports will show here." />}
      </section>
    </>}
  </>;
}

function AdminStudents() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const loadUsers = () => {
    setLoading(true);
    getAdminUsers().then(setUsers).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  };
  useEffect(() => { loadUsers(); }, []);

  const updateUser = async (user, action, value) => {
    setBusyId(user.id);
    setError("");
    try {
      const result = action === "status" ? await updateAdminUserStatus(user.id, value) : await updateAdminUserRole(user.id, value);
      setUsers((current) => current.map((item) => item.id === user.id ? result.user : item));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
  };

  const removeUser = async (user) => {
    if (!window.confirm(`Delete the account for ${user.name}? This cannot be undone.`)) return;
    setBusyId(user.id);
    setError("");
    try {
      await deleteAdminUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
  };

  const filtered = users.filter((user) => {
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesSearch = `${user.name} ${user.email} ${user.studentNumber}`.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return <section className="admin-panel">
    <div className="admin-panel-heading"><div><h2>Student accounts</h2><p>Search accounts and manage access.</p></div><button type="button" className="admin-refresh-button" onClick={loadUsers}>Refresh</button></div>
    <div className="admin-table-tools"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or student number" aria-label="Search student accounts" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter accounts by status"><option value="all">All statuses</option><option value="active">Active</option><option value="disabled">Disabled</option></select><span>{filtered.length} accounts</span></div>
    {error && <p className="form-notice" role="alert">{error}</p>}
    {loading ? <div className="admin-empty-state"><p>Loading accounts…</p></div> : !filtered.length ? <EmptyState title="No matching accounts" message="Try another search or status filter." /> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Student</th><th>Campus ID</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>{filtered.map((user) => <tr key={user.id}>
      <td><strong>{user.name}</strong><small>{user.email}</small></td><td>{user.studentNumber || "—"}</td>
      <td><select disabled={busyId === user.id} value={user.role} onChange={(event) => updateUser(user, "role", event.target.value)} aria-label={`Role for ${user.name}`}><option value="user">Student</option><option value="admin">Admin</option></select></td>
      <td><span className={`admin-account-status ${user.status}`}>{user.status}</span></td><td>{new Date(user.createdAt).toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" })}</td>
      <td><div className="admin-row-actions"><button type="button" disabled={busyId === user.id} onClick={() => updateUser(user, "status", user.status === "active" ? "disabled" : "active")}>{user.status === "active" ? "Disable" : "Activate"}</button><button type="button" className="danger" disabled={busyId === user.id} onClick={() => removeUser(user)}>Delete</button></div></td>
    </tr>)}</tbody></table></div>}
  </section>;
}

function AdminReports() {
  const [status, setStatus] = useState("open");
  const [reports, setReports] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const loadReports = () => {
    setLoading(true);
    getAdminReports(status).then(setReports).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  };
  useEffect(() => { loadReports(); }, [status]);

  const review = async (report, nextStatus) => {
    setBusyId(report._id);
    setError("");
    try {
      await reviewAdminReport(report._id, nextStatus, notes[report._id] || "");
      setReports((current) => current.filter((item) => item._id !== report._id));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
  };

  return <section className="admin-panel">
    <div className="admin-panel-heading"><div><h2>Student reports</h2><p>Review reports about listings and marketplace activity.</p></div><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter reports"><option value="open">Open</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select></div>
    {error && <p className="form-notice" role="alert">{error}</p>}
    {loading ? <div className="admin-empty-state"><p>Loading reports…</p></div> : !reports.length ? <EmptyState title={`No ${status} reports`} message="Reports submitted by students will appear here." /> : <div className="admin-report-list">{reports.map((report) => <article className="admin-report-card" key={report._id}>
      <div className="admin-review-topline"><span className={`admin-account-status ${report.status}`}>{report.status}</span><time>{new Date(report.createdAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</time></div>
      <h3>{report.reason}</h3><p><strong>Listing:</strong> {report.productTitle} · {report.sellerName}</p><p><strong>Reported by:</strong> {report.reporterName}</p>{report.details && <p className="admin-report-details">{report.details}</p>}
      {status === "open" ? <><label className="admin-review-note">Admin note (optional)<input value={notes[report._id] || ""} maxLength={500} onChange={(event) => setNotes((current) => ({ ...current, [report._id]: event.target.value }))} placeholder="Add a note for the report record" /></label><div className="admin-review-actions"><button type="button" className="button button-primary" disabled={busyId === report._id} onClick={() => review(report, "resolved")}>Resolve</button><button type="button" className="button button-secondary" disabled={busyId === report._id} onClick={() => review(report, "dismissed")}>Dismiss</button></div></> : report.adminNote && <p className="admin-review-meta">Admin note: {report.adminNote}</p>}
    </article>)}</div>}
  </section>;
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
        <div className="admin-header-actions"><span className="admin-mode-label"><i />Admin</span><Link className="admin-return-link" to="/app/home">Back to marketplace <span aria-hidden="true">↗</span></Link></div>
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
              <div><p className="eyebrow">KABSUHAYAN · INDANG MAIN CAMPUS</p><h2>Manage your campus marketplace</h2><p>Live account, listing, and report activity.</p></div>
              <span className="admin-welcome-mark" aria-hidden="true"><AdminIcon name="overview" /></span>
            </section>
            <AdminOverview />
          </>}

          {section === "students" && <AdminStudents />}
          {section === "listings" && <ListingModeration />}
          {section === "reports" && <AdminReports />}
        </section>
      </div>
    </main>
  );
}
