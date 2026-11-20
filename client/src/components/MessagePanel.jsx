import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getMessages, getMessageThread, sendMessage } from "../services/api";

function conversationKey(message, userId) {
  const otherUserId = String(message.senderId) === String(userId) ? String(message.recipientId) : String(message.senderId);
  return { key: `${message.productId}:${[String(userId), otherUserId].sort().join(":")}`, otherUserId };
}

export default function MessagePanel({ profile }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [thread, setThread] = useState([]);
  const [threadInfo, setThreadInfo] = useState(null);
  const [draft, setDraft] = useState("");
  const [selected, setSelected] = useState(() => ({
    otherUserId: searchParams.get("with") || "",
    productId: searchParams.get("product") || "",
  }));
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const otherUserId = searchParams.get("with") || "";
    const productId = searchParams.get("product") || "";
    if (otherUserId && productId) setSelected({ otherUserId, productId });
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const refresh = () => getMessages()
      .then((items) => { if (active) setMessages(items); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    refresh();
    const timer = window.setInterval(refresh, 12000);
    return () => { active = false; window.clearInterval(timer); };
  }, [profile.id]);

  useEffect(() => {
    if (!selected.otherUserId || !selected.productId) {
      setThread([]);
      setThreadInfo(null);
      return undefined;
    }

    let active = true;
    const refresh = () => getMessageThread(selected.otherUserId, selected.productId)
      .then((result) => {
        if (!active) return;
        setThreadInfo(result);
        setThread(result.messages);
        const readAt = new Date().toISOString();
        setMessages((current) => current.map((message) =>
          String(message.productId) === String(selected.productId)
            && String(message.senderId) === String(selected.otherUserId)
            && String(message.recipientId) === String(profile.id)
            ? { ...message, readAt: message.readAt || readAt }
            : message
        ));
        setError("");
      })
      .catch((requestError) => { if (active) setError(requestError.message); });
    refresh();
    const timer = window.setInterval(refresh, 8000);
    return () => { active = false; window.clearInterval(timer); };
  }, [profile.id, selected.otherUserId, selected.productId]);

  const conversations = useMemo(() => {
    const grouped = new Map();
    for (const message of messages) {
      const { key, otherUserId } = conversationKey(message, profile.id);
      const current = grouped.get(key);
      const otherName = String(message.senderId) === String(profile.id) ? message.recipientName : message.senderName;
      if (!current) {
        grouped.set(key, {
          key,
          otherUserId,
          otherName,
          productId: String(message.productId),
          productTitle: message.productTitle,
          lastMessage: message,
          unread: String(message.recipientId) === String(profile.id) && !message.readAt ? 1 : 0,
        });
      } else if (String(message.recipientId) === String(profile.id) && !message.readAt) {
        current.unread += 1;
      }
    }
    return [...grouped.values()].sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
  }, [messages, profile.id]);

  const openConversation = (conversation) => {
    setSelected({ otherUserId: conversation.otherUserId, productId: conversation.productId });
    setSearchParams({ with: conversation.otherUserId, product: conversation.productId });
  };

  const submit = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !selected.otherUserId || !selected.productId) return;
    setSending(true);
    setError("");
    try {
      await sendMessage({ recipientId: selected.otherUserId, productId: selected.productId, body });
      setDraft("");
      const result = await getMessageThread(selected.otherUserId, selected.productId);
      setThreadInfo(result);
      setThread(result.messages);
      const inbox = await getMessages();
      setMessages(inbox);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  };

  return <div className="messages-panel">
    <aside className="conversation-list">
      <h2>Conversations</h2>
      {loading ? <p className="messages-list-empty">Loading messages…</p> : conversations.length ? conversations.map((conversation) => <button type="button" className={`conversation-item ${selected.otherUserId === conversation.otherUserId && selected.productId === conversation.productId ? "active" : ""}`} key={conversation.key} onClick={() => openConversation(conversation)}>
        <span className="conversation-avatar">{conversation.otherName?.[0]?.toUpperCase() || "S"}</span>
        <span className="conversation-copy"><strong>{conversation.otherName}</strong><small>{conversation.productTitle}</small><small>{conversation.lastMessage.body}</small></span>
        {conversation.unread > 0 && <span className="conversation-unread">{conversation.unread}</span>}
      </button>) : <div className="messages-list-empty"><h3>No messages yet</h3><p>Open a listing and message its seller to start a conversation.</p><Link className="button button-secondary" to="/app/marketplace">Browse items</Link></div>}
    </aside>

    <section className="message-thread" aria-label="Message conversation">
      {selected.otherUserId && selected.productId ? <>
        <header className="message-thread-header"><div><strong>{threadInfo?.otherUser?.name || conversations.find((item) => item.otherUserId === selected.otherUserId)?.otherName || "Conversation"}</strong><small>About {threadInfo?.product?.title || conversations.find((item) => item.productId === selected.productId)?.productTitle || "listing"}</small></div></header>
        {error && <p className="form-notice" role="alert">{error}</p>}
        <div className="message-thread-body">
          {thread.length ? thread.map((message) => <article className={`message-bubble ${String(message.senderId) === String(profile.id) ? "sent" : "received"}`} key={message.messageId}>
            <p>{message.body}</p><small>{new Date(message.createdAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</small>
          </article>) : <p className="message-thread-empty">Start the conversation with a question about this listing.</p>}
        </div>
        <form className="message-composer" onSubmit={submit}>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} placeholder="Write a message…" aria-label="Write a message" />
          <button className="button button-primary" type="submit" disabled={!draft.trim() || sending}>{sending ? "Sending…" : "Send"}</button>
        </form>
      </> : <div className="empty-state messages-empty"><h2>Select a conversation</h2><p>Choose a conversation or open a listing to message its seller.</p></div>}
    </section>
  </div>;
}
