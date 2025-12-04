// components/ChatWindow/ChatWindow.jsx
import React, { useEffect, useRef, useState } from "react";
import "./ChatWindow.css";

const API_URL = "http://localhost:4000/api";

function ChatWindow({
  chatId,
  currentUser,
  otherUser,
  requestTitle,
  isReadOnly,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUserId = currentUser?._id || currentUser?.id;

  // Demande la permission de notification au chargement
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Scroll automatique
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Charger les messages + polling
  useEffect(() => {
    if (!chatId) return;

    let intervalId;

    async function fetchMessages() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("Error fetching messages:", data);
          return;
        }

        const msgs = Array.isArray(data.messages) ? data.messages : [];
        setMessages(msgs);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
    intervalId = setInterval(fetchMessages, 3000);

    return () => clearInterval(intervalId);
  }, [chatId]);

  // Envoyer un message
  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || isReadOnly) return;

    try {
      setSending(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Error sending message:", data);
        alert(data.error || "Failed to send message");
        return;
      }

      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }

      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Error sending message");
    } finally {
      setSending(false);
    }
  }

  // Notifications pour nouveaux messages des autres
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const senderId = lastMessage?.sender?._id || lastMessage?.sender;

    if (senderId && senderId !== currentUserId) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("New message", {
          body: lastMessage.text,
        });
      }
    }
  }, [messages, currentUserId]);

  // Déterminer le nom de l'autre utilisateur
  let otherUserName =
    otherUser?.name || otherUser?.firstname || otherUser?.email || "User";

  if (!otherUserName && messages.length > 0) {
    const otherMsg = messages.find((msg) => {
      const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
      return senderId && senderId !== currentUserId;
    });
    if (otherMsg?.sender) {
      otherUserName =
        otherMsg.sender.name ||
        otherMsg.sender.firstname ||
        otherMsg.sender.email ||
        "User";
    }
  }

  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-title">
          {requestTitle && (
            <div style={{ fontWeight: "bold", fontSize: "13px" }}>
              Chat about: {requestTitle}
            </div>
          )}
          <div style={{ fontSize: "12px" }}>With {otherUserName}</div>
        </div>
        <button className="chat-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="chat-messages">
        {loading && safeMessages.length === 0 && (
          <div className="chat-info">Loading messages…</div>
        )}

        {safeMessages.map((msg, index) => {
          const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
          const isMine = senderId && senderId === currentUserId;
          const senderName = isMine ? "You" : otherUserName;

          return (
            <div
              key={msg._id || index}
              className={`chat-message ${isMine ? "mine" : "theirs"}`}
            >
              <div className="chat-bubble">
                <div className="chat-text">{msg.text}</div>
                <div className="chat-meta">
                  {senderName}
                  {msg.createdAt && (
                    <>
                      {" · "}
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        {isReadOnly && (
          <div
            className="chat-info"
            style={{ fontSize: "11px", marginBottom: "4px", opacity: 0.7 }}
          >
            This mitzva is completed. Chat is read-only.
          </div>
        )}

        <input
          type="text"
          placeholder={
            isReadOnly ? "Chat closed for completed mitzva" : "Type a message…"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={sending || isReadOnly}
        />
        <button type="submit" disabled={sending || !text.trim() || isReadOnly}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
