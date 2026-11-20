import { Link } from "react-router-dom";

export default function MessagePanel() {
  return (
    <div className="messages-panel">
      <div className="empty-state messages-empty">
        <h2>No messages yet</h2>
        <p>Your inbox is clear. Messaging is still being set up, so there are no conversations to show yet.</p>
        <Link className="button button-secondary" to="/app/marketplace">Browse items</Link>
      </div>
    </div>
  );
}
