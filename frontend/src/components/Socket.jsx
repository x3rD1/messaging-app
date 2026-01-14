import { io } from "socket.io-client";
import { useState, useEffect, useContext, useRef } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { accessToken } = useContext(AuthContext);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [accessToken]);

  const handleUserSelect = (selectedUser) => {
    setUser(selectedUser);
    if (isMobile) {
      setShowChat(true);
    }
  };

  const handleBackToUsers = () => {
    setShowChat(false);
    setUser(null);
    setRoomId(null);
    setMessages([]);
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.sidebar} ${
          isMobile && showChat ? styles.hidden : ""
        }`}
      >
        <Users
          setUser={handleUserSelect}
          setRoomId={setRoomId}
          setMessages={setMessages}
          selectedUser={user}
        />
      </div>
      {(!isMobile || showChat) && (
        <div className={styles.chatArea}>
          <Convo
            user={user}
            roomId={roomId}
            messages={messages}
            setMessages={setMessages}
            onBack={isMobile ? handleBackToUsers : undefined}
            isMobile={isMobile}
          />
        </div>
      )}
    </div>
  );
}

export default Socket;

function Users({ setUser, setRoomId, setMessages, selectedUser }) {
  const [users, setUsers] = useState([]);
  const [recentMessages, setRecentMessages] = useState({});
  const { accessToken, loading, userInfo, logoutUser } =
    useContext(AuthContext);

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

    const fetchRecentMessages = async () => {
      try {
        const res = await fetch(
          "https://messaging-app-production-8a6f.up.railway.app/users/recent-messages",
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await res.json();
        setRecentMessages(data.recentMessages || {});
      } catch (err) {
        console.log("Failed to fetch recent messages", err);
      }
    };
    fetchRecentMessages();
  }, [accessToken, loading]);

  const handleClick = async (id, name) => {
    setUser({ id, name });

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

  const formatRecentTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  return (
    <div className={styles.usersList}>
      <div className={styles.usersHeader}>
        <h2>Chats</h2>
      </div>
      <div className={styles.usersContainer}>
        {users.map((user) => {
          if (user.id === userInfo.sub) return null;

          const recentMsg = recentMessages[user.id];
          const isSelected = selectedUser?.id === user.id;

          return (
            <div
              key={user.id}
              className={`${styles.userItem} ${
                isSelected ? styles.selected : ""
              }`}
              onClick={() => handleClick(user.id, user.username)}
            >
              <div className={styles.userAvatar}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userHeader}>
                  <div className={styles.userName}>{user.username}</div>
                  {recentMsg && (
                    <div className={styles.recentTime}>
                      {formatRecentTime(recentMsg.timestamp)}
                    </div>
                  )}
                </div>
                <div className={styles.recentMessage}>
                  {recentMsg ? recentMsg.text : "Click to start chat"}
                </div>
              </div>
              {recentMsg && !recentMsg.isRead && (
                <div className={styles.unreadBadge}></div>
              )}
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
        <button className={styles.logoutButton} onClick={logoutUser}>
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

function Convo({ user, roomId, messages, setMessages, onBack, isMobile }) {
  const otherId = user?.id;
  const { userInfo, accessToken } = useContext(AuthContext);
  const senderId = userInfo.sub;
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAtBottom && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  // Handle scroll events to detect if user has scrolled up
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      const isBottom = distanceFromBottom < 50;
      setIsAtBottom(isBottom);
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Scroll to bottom function
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
  };

  // Initial scroll to bottom when opening a chat
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [roomId, messages.length]);

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
            {isMobile && (
              <button className={styles.backButton} onClick={onBack}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}
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

          <div className={styles.messagesContainer} ref={messagesContainerRef}>
            <div className={styles.messagesList}>
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
            <div ref={messagesEndRef}></div>
          </div>

          <div className={styles.messageInputContainer}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className={styles.messageInput}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend} className={styles.sendButton}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
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
