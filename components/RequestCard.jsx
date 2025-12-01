import React, { useState } from "react";
import ChatWindow from "./ChatWindow/ChatWindow"; // we'll create this

function RequestCard({ request, currentUser }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const otherUser = request.createdBy; // adapt to your data (could be completedBy etc.)

  return (
    <div className="request-card">
      <h3>{request.title}</h3>
      <p>{request.description}</p>

      <button onClick={() => setIsChatOpen(true)}>
        Chat
      </button>

      {isChatOpen && (
        <ChatWindow
          chatId={request._id}              // or a real chatId if you already have one
          currentUser={currentUser}        // { _id, name, ... }
          otherUser={otherUser}            // { _id, name, ... }
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}

export default RequestCard;
