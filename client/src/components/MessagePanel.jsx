import { useState } from "react";

const sampleChats = [
  { name: "Mika R.", item: "Green T-Shirt Oversize", last: "Is it still available?", time: "10:42 AM" },
  { name: "Ana L.", item: "Calculus textbook", last: "We can meet by the library.", time: "Yesterday" },
  { name: "Paolo D.", item: "PE Uniform Set", last: "What size are you looking for?", time: "Mon" },
];

export default function MessagePanel() {
  const [selected, setSelected] = useState(0);
  const [draft, setDraft] = useState("");
  const [sentMessages, setSentMessages] = useState([]);
  const chat = sampleChats[selected];

  const send = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setSentMessages((messages) => [...messages, draft.trim()]);
    setDraft("");
    // FUTURE API CONNECTION: POST /api/conversations/:id/messages.
  };

  return (
    <div className="messages-panel">
      <aside className="conversation-list">
        <h2>Conversations</h2>
        {sampleChats.map((conversation, index) => (
          <button
            className={`conversation-row ${selected === index ? "active" : ""}`}
            key={conversation.name}
            onClick={() => { setSelected(index); setSentMessages([]); }}
          >
            <span className="person-mark">{conversation.name[0]}</span>
            <span className="conversation-text">
              <strong>{conversation.name}</strong>
              <small>{conversation.item}</small>
              <small>{conversation.last}</small>
            </span>
            <time>{conversation.time}</time>
          </button>
        ))}
      </aside>
      <section className="chat-window">
        <header className="chat-heading"><span className="person-mark">{chat.name[0]}</span><span><strong>{chat.name}</strong><small>About {chat.item}</small></span></header>
        <div className="chat-messages">
          <div className="product-context">Conversation about <strong>{chat.item}</strong></div>
          <p className="chat-date">Today</p>
          <p className="message received">{chat.last}<small>{chat.time}</small></p>
          <p className="message sent">Hi! Yes, it’s available. We can meet on campus.<small>10:45 AM</small></p>
          {sentMessages.map((message, index) => <p className="message sent" key={`${message}-${index}`}>{message}<small>Now</small></p>)}
        </div>
        <form className="message-compose" onSubmit={send}>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message" aria-label="Write a message" />
          <button className="button button-primary" type="submit">Send</button>
        </form>
        <small className="field-hint chat-hint">Demo conversation. Messages are not saved between visits.</small>
      </section>
    </div>
  );
}
