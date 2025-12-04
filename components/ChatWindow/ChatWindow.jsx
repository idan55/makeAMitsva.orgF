// components/ChatWindow/ChatWindow.jsx
import React, { useEffect, useRef, useState } from "react";
import "./ChatWindow.css"

const API_URL = "http://localhost:4000/api";

function ChatWindow({
  chatId,
  currentUser,
  otherUser,
  requestTitle,
  isReadOnly,
  onClose,
  onNewMessage,
  visible = true,
}) {
  const [messages, setMessages] = useState([]); // always array
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const lastOtherMessageRef = useRef(null);
  const initialLoadRef = useRef(true);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load messages + poll
  useEffect(() => {
    if (!chatId) return;

    let intervalId;

    async function fetchMessages({ initial = false } = {}) {
      try {
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

        // On initial load, baseline the last message and skip notifications
        if (initial && msgs.length > 0) {
          const latest = msgs[msgs.length - 1];
          lastOtherMessageRef.current = latest._id || msgs.length;
          return;
        }

        // Notification for new messages from others
        if (msgs.length > 0) {
          const latest = msgs[msgs.length - 1];
          const senderId =
            typeof latest.sender === "string" ? latest.sender : latest.sender?._id;
          const currentUserIdLocal = currentUser?._id || currentUser?.id;

          if (
            senderId &&
            senderId !== currentUserIdLocal &&
            lastOtherMessageRef.current !== (latest._id || msgs.length)
          ) {
            lastOtherMessageRef.current = latest._id || msgs.length;
            onNewMessage?.({
              from: latest.sender?.name || otherUser?.name || "Someone",
              requestTitle,
              chatId,
              requestId: otherUser?._id || otherUser?.id,
              otherUser,
              messageId: latest._id || latest.createdAt,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        if (initial) {
          setLoading(false);
          initialLoadRef.current = false;
        }
      }
    }

    fetchMessages({ initial: true });
    intervalId = setInterval(() => fetchMessages({ initial: false }), 800);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [chatId]);

  async function sendMessage({ textToSend, attachments = [] }) {
    if (!textToSend.trim() && attachments.length === 0) return;

    // 🔒 If read-only: do nothing
    if (isReadOnly) {
      return;
    }

    try {
      setSending(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ text: textToSend, attachments }),
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

  async function handleSend(e) {
    e.preventDefault();
    await sendMessage({ textToSend: text, attachments: [] });
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;

    // Reset input so same file can be selected again
    e.target.value = "";

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const uploadRes = await fetch(`${API_URL}/chats/${chatId}/attachments`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Upload failed");
      }

      await sendMessage({
        textToSend: "",
        attachments: [
          {
            url: uploadData.url,
            type: uploadData.type,
            publicId: uploadData.publicId,
            originalName: uploadData.originalName,
          },
        ],
      });
    } catch (err) {
      console.error("Attachment upload error:", err);
      alert(err.message || "Failed to send attachment");
    } finally {
      setUploading(false);
    }
  }

  const safeMessages = Array.isArray(messages) ? messages : [];

  const currentUserId = currentUser?._id || currentUser?.id;

  let otherUserName =
    otherUser?.name || otherUser?.firstname || otherUser?.email || null;

  // If no name from props, try derive from messages
  if (!otherUserName && safeMessages.length > 0) {
    const otherMsg = safeMessages.find((msg) => {
      const senderId =
        typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
      return senderId && senderId !== currentUserId;
    });

    if (otherMsg && otherMsg.sender) {
      otherUserName =
        otherMsg.sender.name ||
        otherMsg.sender.firstname ||
        otherMsg.sender.email ||
        null;
    }
  }

  if (!otherUserName) {
    otherUserName = "User";
  }

  return (
    <div
      className={`chat-window ${expanded ? "expanded" : ""}`}
      style={{ display: visible ? "flex" : "none" }}
    >
      <div className="chat-header">
        <div className="chat-title">
          {requestTitle && (
            <div style={{ fontWeight: "bold", fontSize: "13px" }}>
              Chat about: {requestTitle}
            </div>
          )}
          <div style={{ fontSize: "12px" }}>With {otherUserName}</div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            className="chat-toggle"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        <button className="chat-close" onClick={onClose}>
          ×
        </button>
        </div>
      </div>

      <div className="chat-messages">
        {loading && safeMessages.length === 0 && (
          <div className="chat-info">Loading messages…</div>
        )}

        {safeMessages.map((msg, index) => {
          const senderId =
            typeof msg.sender === "string" ? msg.sender : msg.sender?._id;

          const isMine =
            senderId &&
            (senderId === currentUser?._id || senderId === currentUser?.id);

          const senderName =
            msg.sender?.name ||
            msg.sender?.firstname ||
            (isMine ? "You" : otherUserName);

          return (
            <div
              key={msg._id || index}
              className={`chat-message ${isMine ? "mine" : "theirs"}`}
            >
              <div className="chat-bubble">
                {msg.text && <div className="chat-text">{msg.text}</div>}
                {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                  <div className="chat-attachments">
                    {msg.attachments.map((att, i) => (
                      <div key={i} className="chat-attachment">
                        {att.type === "image" ? (
                          <img
                            src={att.url}
                            alt={att.originalName || "image"}
                            onDoubleClick={() => setPreviewAttachment(att.url)}
                          />
                        ) : att.type === "video" ? (
                          <video src={att.url} controls />
                        ) : (
                          <a href={att.url} target="_blank" rel="noreferrer">
                            {att.originalName || "Download file"}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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

      {isReadOnly ? (
        <div className="chat-input-area" style={{ justifyContent: "center", color: "#666" }}>
          <div className="chat-info" style={{ fontSize: "12px" }}>
            This mitzva is completed. Chat is read-only.
          </div>
        </div>
      ) : (
        <>
          <form className="chat-input-area" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={sending}
            />
            <label className="chat-attach">
              📎
              <input type="file" accept="image/*,video/*" onChange={handleFileChange} disabled={uploading || sending} />
            </label>
            <button type="submit" disabled={sending || !text.trim()}>
              {sending ? "..." : "Send"}
            </button>
          </form>
          {uploading && <div className="chat-info">Uploading…</div>}
        </>
      )}
      {previewAttachment && (
        <div className="chat-preview-overlay" onClick={() => setPreviewAttachment(null)}>
          <img src={previewAttachment} alt="preview" />
        </div>
      )}
    </div>
  );
}

export default ChatWindow;
