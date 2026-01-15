import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../context/AuthContext";
import styles from "./Settings.module.css";

function Settings({ userInfo, onClose }) {
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState(userInfo.email);
  const { accessToken } = useContext(AuthContext);

  const handleSaveEmail = async (newEmail) => {
    try {
      const res = await fetch(
        `http://localhost:3000/users/${userInfo.sub}/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email: newEmail }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEmail(data.email);
    } catch (err) {
      console.log("Failed to update email.", err);
    }
  };

  return (
    <div className={styles.settingsWrapper}>
      <div className={styles.settingsCard}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {userInfo.username.charAt(0).toUpperCase()}
          </div>
          <h2>{userInfo.username}</h2>
        </div>

        <section className={styles.section}>
          <h3>Account</h3>

          <div className={styles.field}>
            <label>Email</label>
            <div className={styles.field}>
              <EditableText
                value={email}
                type="email"
                onSave={handleSaveEmail}
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3>Profile</h3>

          <div className={styles.field}>
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Add a few words about yourself"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;

function EditableText({ value, onSave, type = "text" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setDraft(value);
    setIsEditing(true);
  };

  const save = () => {
    setIsEditing(false);
    if (draft !== value) {
      onSave(draft);
    }
  };

  const cancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      save();
    }
    if (e.key === "Escape") {
      cancel();
    }
  };

  return (
    <div>
      {isEditing ? (
        <input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <span
          onClick={startEditing}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && startEditing()}
          style={{ cursor: "pointer" }}
        >
          {value}
        </span>
      )}
    </div>
  );
}
