import { useState } from "react";
import { Link, useLocation } from "react-router";

const tabs = [
  ["overview", "Overview"],
  ["students", "Students"],
  ["listings", "Listings"],
  ["reports", "Reports"],
];

export default function AdminPages() {
  const location = useLocation();
  const section = location.pathname.split("/")[2] || "overview";
  const heading = tabs.find(([id]) => id === section)?.[1] || "Overview";
  const [students, setStudents] = useState([
    { id: 1, name: "Mika Reyes", status: "Verified", suspended: false },
    { id: 2, name: "Paolo Dela Cruz", status: "Verified", suspended: false },
    { id: 3, name: "Ana Lopez", status: "Needs review", suspended: false },
  ]);
  const [listings, setListings] = useState([
    { id: 1, title: "Green T-Shirt Oversize", seller: "Mika Reyes", status: "Reported" },
    { id: 2, title: "Calculus textbook", seller: "Paolo Dela Cruz", status: "Active" },
  ]);
  const [reports, setReports] = useState([
    { id: 1, title: "Misleading listing details", status: "Open" },
    { id: 2, title: "Incorrect category", status: "Open" },
  ]);
  const updateStudent = (id, updates) => setStudents((current) => current.map((student) => student.id === id ? { ...student, ...updates } : student));
  const updateListing = (id, status) => setListings((current) => current.map((listing) => listing.id === id ? { ...listing, status } : listing));
  const resolveReport = (id) => setReports((current) => current.map((report) => report.id === id ? { ...report, status: "Resolved" } : report));

  return <main className="admin-page">
    <header className="admin-header"><Link className="admin-brand" to="/app/home">KabsuHayán <small>Admin preview</small></Link><Link to="/app/home">Return to marketplace</Link></header>
    <div className="admin-layout"><nav className="admin-tabs" aria-label="Admin pages">{tabs.map(([id, label]) => <Link key={id} className={id === section ? "active" : ""} to={`/admin/${id}`}>{label}</Link>)}</nav>
      <section className="admin-content"><p className="eyebrow">CAMPUS MODERATION</p><h1>{heading}</h1>
        {section === "overview" && <><p className="page-intro">A quick look at the student marketplace.</p><div className="admin-stats"><article><small>Student accounts</small><b>{students.length}</b></article><article><small>Active listings</small><b>{listings.filter((item) => item.status === "Active").length}</b></article><article><small>Open reports</small><b>{reports.filter((report) => report.status === "Open").length}</b></article></div><div className="admin-table"><h2>Recent activity</h2><p>Listing moderation <span>{listings.length} sample items</span></p><p>Student account review <span>{students.filter((student) => student.status === "Needs review").length} need review</span></p><p>Reports to resolve <span>{reports.filter((report) => report.status === "Open").length} open</span></p></div></>}
        {section === "students" && <div className="admin-table"><h2>Student accounts</h2>{students.map((student) => <p className="admin-action-row" key={student.id}><b>{student.name}{student.suspended ? " · Suspended" : ""}</b><span>{student.status}<button onClick={() => updateStudent(student.id, { status: student.status === "Verified" ? "Needs review" : "Verified" })}>{student.status === "Verified" ? "Recheck" : "Verify"}</button><button className={student.suspended ? "" : "danger-link"} onClick={() => updateStudent(student.id, { suspended: !student.suspended })}>{student.suspended ? "Restore" : "Suspend"}</button></span></p>)}<small>Account actions are local admin preview controls.</small></div>}
        {section === "listings" && <div className="admin-table"><h2>Listing moderation</h2>{listings.map((listing) => <p className="admin-action-row" key={listing.id}><b>{listing.title}<small>Posted by {listing.seller}</small></b><span>{listing.status}<button onClick={() => updateListing(listing.id, "Active")}>Approve</button><button className="danger-link" onClick={() => updateListing(listing.id, "Removed")}>Remove</button></span></p>)}<small>Removed listings remain in this preview so you can review the moderation action.</small></div>}
        {section === "reports" && <div className="admin-table"><h2>Recent reports</h2>{reports.map((report) => <p className="admin-action-row" key={report.id}><b>{report.title}</b><span>{report.status}<button onClick={() => resolveReport(report.id)} disabled={report.status === "Resolved"}>{report.status === "Open" ? "Resolve" : "Done"}</button></span></p>)}<small>Reports and decisions are sample data stored only in page state.</small></div>}
      </section>
    </div>
  </main>;
}
