import { io } from "socket.io-client";
import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import styles from "./Socket.module.css";

const socket = io("https://messaging-app-production-8a6f.up.railway.app", {
  withCredentials: true,
  autoConnect: false,
});

function Socket() {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const { accessToken } = useContext(AuthContext);

  useEffect(() => {
    if (!accessToken) return;

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [accessToken]);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Users
          setUser={setUser}
          setRoomId={setRoomId}
          setMessages={setMessages}
        />
      </div>
      <div className={styles.chatArea}>
        <Convo
          user={user}
          roomId={roomId}
          messages={messages}
          setMessages={setMessages}
        />
      </div>
    </div>
  );
}

export default Socket;

function Users({ setUser, setRoomId, setMessages }) {
  const [users, setUsers] = useState([]);
  const { accessToken, loading, userInfo, logout } = useContext(AuthContext);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    if (loading || !accessToken) return;

    fetch("https://messaging-app-production-8a6f.up.railway.app/users/all", {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data.users));
  }, [accessToken, loading]);

  const handleClick = async (id, name) => {
    setSelectedUserId(id);
    setUser((prev) => ({ ...prev, id, name }));

    try {
      const res = await fetch(
        "https://messaging-app-production-8a6f.up.railway.app/chat/direct",
        {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: userInfo.sub, otherId: id }),
        }
      );

      if (!res.ok) throw new Error("Error getting roomId");

      const data = await res.json();
      setRoomId(data.room.id);
      getAllMessages(id, data.room.id, setMessages);
    } catch (err) {
      console.log(err);
    }
  };

  const getAllMessages = async (id, roomId, setMessages) => {
    try {
      const res = await fetch(
        `https://messaging-app-production-8a6f.up.railway.app/users/${id}/chat/${roomId}/messages`,
        {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await res.json();

      setMessages(
        data.messages.map((m) => ({
          text: m.content,
          from: m.senderId,
          timestamp: m.createdAt,
        }))
      );
    } catch (err) {
      console.log("Failed to fetch all messages", err);
    }
  };

  const handleSettings = () => {
    //  settings logic
    console.log("Settings clicked");
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(
        "https://messaging-app-production-8a6f.up.railway.app/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Logout failed");
      }

      logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className={styles.usersList}>
      <div className={styles.usersHeader}>
        <h2>Chats</h2>
      </div>
      <div className={styles.usersContainer}>
        {users.map((user) => {
          if (user.id === userInfo.sub) return null;
          return (
            <div
              key={user.id}
              className={`${styles.userItem} ${
                selectedUserId === user.id ? styles.selected : ""
              }`}
              onClick={() => handleClick(user.id, user.username)}
            >
              <div className={styles.userAvatar}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{user.username}</div>
                <div className={styles.lastMessage}>Click to start chat</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom bar with settings and logout */}
      <div className={styles.bottomBar}>
        <button
          className={styles.settingsButton}
          onClick={handleSettings}
          title="Settings"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m4.22-10.22l1.42-1.42M6.36 17.64l1.42-1.42M1 12h6m6 0h6m-10.22 4.22l-1.42 1.42M17.64 6.36l-1.42 1.42"></path>
          </svg>
        </button>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}

function Convo({ user, roomId, messages, setMessages }) {
  const otherId = user?.id;
  const { userInfo, accessToken } = useContext(AuthContext);
  const senderId = userInfo.sub;
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!roomId) return;

    socket.emit("join-room", roomId);

    const handleIncoming = (message) => {
      setMessages((prev) => [
        ...prev,
        { text: message.msg, from: message.userId },
      ]);
    };

    socket.on("message", handleIncoming);

    return () => {
      socket.emit("leave-room", roomId);
      socket.off("message", handleIncoming);
    };
  }, [roomId, setMessages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMsg = { text: message, from: userInfo.sub };
    setMessages((prev) => [...prev, newMsg]);
    emitMessage(message);
    setMessage("");

    try {
      const res = await fetch(
        `https://messaging-app-production-8a6f.up.railway.app/users/${user.id}/chat/${roomId}/message/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify({ message, roomId, senderId }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
    } catch (err) {
      console.log("Failed to send a message", err.message);
    }
  };

  const emitMessage = (message) => {
    socket.emit("message", {
      roomId,
      msg: message,
      userId: userInfo.sub,
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={styles.conversation}>
      {otherId ? (
        <>
          <div className={styles.conversationHeader}>
            <div className={styles.receiverInfo}>
              <div className={styles.receiverAvatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.receiverDetails}>
                <h3>{user.name}</h3>
                <span className={styles.onlineStatus}>online</span>
              </div>
            </div>
          </div>

          <div className={styles.messagesContainer}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.message} ${
                  m.from === userInfo.sub ? styles.sent : styles.received
                }`}
              >
                <div className={styles.messageContent}>{m.text}</div>
                <div className={styles.messageTime}>
                  {formatTime(m.timestamp)}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.messageInputContainer}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className={styles.messageInput}
            />
            <button onClick={handleSend} className={styles.sendButton}>
              Send
            </button>
          </div>
        </>
      ) : (
        <div className={styles.noConversation}>
          <div className={styles.noConversationContent}>
            <h2>Welcome to Chat</h2>
            <p>Select a user from the left sidebar to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
