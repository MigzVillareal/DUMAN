import { useEffect, useRef, useState } from "react";
import { fetchUsers, USE_MOCK_GROUPS } from "../services/groupService.js";
import { mapApiUserToInvitable, isSameAsAuthUser } from "../utils/groups.js";
import { INVITABLE_USERS } from "../data/groupsMock.js";
import { useAuth } from "../context/AuthContext.jsx";
import Icon from "./Icon.jsx";
import "../css/components_styles/CreateGroupModal.css";

function userMatchesSearch(user, normalized) {
  const name = user.name.toLowerCase();
  const email = user.email.toLowerCase();
  return name.startsWith(normalized) || email.startsWith(normalized);
}

function getMemberSuggestions(query, addedMembers, authUser, invitableUsers) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const addedIds = new Set(addedMembers.map((member) => member.id));

  return invitableUsers.filter(
    (user) =>
      !isSameAsAuthUser(user, authUser) &&
      !addedIds.has(user.id) &&
      userMatchesSearch(user, normalized)
  );
}

function findInvitableUser(query, addedMembers, authUser, invitableUsers) {
  const suggestions = getMemberSuggestions(
    query,
    addedMembers,
    authUser,
    invitableUsers
  );
  if (suggestions.length === 1) return suggestions[0];

  const normalized = query.trim().toLowerCase();
  return (
    suggestions.find(
      (user) =>
        user.name.toLowerCase() === normalized ||
        user.email.toLowerCase() === normalized
    ) ?? null
  );
}

function isSelfSearch(query, authUser, invitableUsers) {
  const normalized = query.trim().toLowerCase();
  if (!normalized || !authUser) return false;

  return invitableUsers.some(
    (user) => isSameAsAuthUser(user, authUser) && userMatchesSearch(user, normalized)
  );
}

export default function CreateGroupModal({
  onClose,
  onSubmit,
  submitting = false,
  submitError = "",
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [invitableUsers, setInvitableUsers] = useState([]);
  const [error, setError] = useState("");
  const [memberError, setMemberError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const overlayRef = useRef(null);
  const nameInputRef = useRef(null);
  const searchWrapRef = useRef(null);

  const memberSuggestions = getMemberSuggestions(
    memberSearch,
    members,
    user,
    invitableUsers
  );

  useEffect(() => {
    if (USE_MOCK_GROUPS) {
      setInvitableUsers(INVITABLE_USERS);
      return;
    }

    let cancelled = false;

    async function loadUsers() {
      try {
        const data = await fetchUsers();
        if (cancelled) return;

        if (data.users) {
          setInvitableUsers(data.users.map(mapApiUserToInvitable));
          return;
        }
      } catch {
        // Fall back to mock users when the API is unavailable.
      }

      if (!cancelled) {
        setInvitableUsers(INVITABLE_USERS);
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!searchWrapRef.current?.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOverlayClick = (event) => {
    if (event.target === overlayRef.current) onClose();
  };

  const handleAddMember = (selectedUser) => {
    if (isSelfSearch(memberSearch, user, invitableUsers)) {
      setMemberError("You can't add yourself.");
      return;
    }

    const match =
      selectedUser ??
      findInvitableUser(memberSearch, members, user, invitableUsers);

    if (!match) {
      setMemberError("No matching user found.");
      return;
    }

    if (isSameAsAuthUser(match, user)) {
      setMemberError("You can't add yourself.");
      return;
    }

    if (members.some((member) => member.id === match.id)) {
      setMemberError("Member already added.");
      return;
    }

    setMembers((prev) => [...prev, { ...match, role: "member" }]);
    setMemberSearch("");
    setMemberError("");
    setShowSuggestions(false);
  };

  const handleRemoveMember = (memberId) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Group name is required.");
      return;
    }

    setError("");

    await onSubmit({
      name: trimmedName,
      description: description.trim(),
      members,
    });
  };

  return (
    <div
      className="create-group-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-group-title"
    >
      <div className="create-group-modal">
        <form className="create-group-modal__content" onSubmit={handleSubmit}>
          <h2 id="create-group-title" className="create-group-modal__title">
            Create New Group
          </h2>

          {(error || submitError) && (
            <p className="create-group-modal__error">{error || submitError}</p>
          )}

          <div className="create-group-modal__field">
            <label className="create-group-modal__label" htmlFor="group-name">
              Group Name
            </label>
            <input
              ref={nameInputRef}
              id="group-name"
              className="create-group-modal__input"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError("");
              }}
              maxLength={80}
            />
          </div>

          <div className="create-group-modal__field">
            <label
              className="create-group-modal__label"
              htmlFor="group-description"
            >
              Description
            </label>
            <input
              id="group-description"
              className="create-group-modal__input"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={300}
            />
          </div>

          <div className="create-group-modal__field">
            <span className="create-group-modal__label">Invite Members</span>

            <div
              className="create-group-modal__search-wrap"
              ref={searchWrapRef}
            >
              <div className="create-group-modal__invite-row">
                <input
                  id="group-member-search"
                  className="create-group-modal__input create-group-modal__input--search"
                  type="text"
                  placeholder="Search by name or email..."
                  value={memberSearch}
                  onChange={(event) => {
                    setMemberSearch(event.target.value);
                    setShowSuggestions(true);
                    if (memberError) setMemberError("");
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddMember();
                    }
                  }}
                  aria-autocomplete="list"
                  aria-controls="member-suggestions"
                  aria-expanded={showSuggestions && memberSuggestions.length > 0}
                />
                <button
                  type="button"
                  className="create-group-modal__add-btn"
                  aria-label="Add member"
                  onClick={() => handleAddMember()}
                >
                  <Icon icon="plus" size="sm" />
                </button>
              </div>

              {showSuggestions && memberSearch.trim() && memberSuggestions.length > 0 && (
                <ul
                  id="member-suggestions"
                  className="create-group-modal__suggestions"
                  role="listbox"
                >
                  {memberSuggestions.map((user) => (
                    <li key={user.id} role="none">
                      <button
                        type="button"
                        className="create-group-modal__suggestion-item"
                        role="option"
                        onClick={() => handleAddMember(user)}
                      >
                        <span className="create-group-modal__suggestion-name">
                          {user.name}
                        </span>
                        <span className="create-group-modal__suggestion-email">
                          {user.email}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {memberError && (
              <p className="create-group-modal__member-error">{memberError}</p>
            )}

            <div className="create-group-modal__member-list">
              {members.length === 0 ? (
                <p className="create-group-modal__member-empty">
                  Added members will appear here.
                </p>
              ) : (
                <ul className="create-group-modal__member-items">
                  {members.map((member) => (
                    <li key={member.id} className="create-group-modal__member-item">
                      <div className="create-group-modal__member-info">
                        <div className="create-group-modal__member-name-row">
                          <span className="create-group-modal__member-name">
                            {member.name}
                          </span>
                        </div>
                        <span className="create-group-modal__member-email">
                          {member.email}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="create-group-modal__remove-btn"
                        aria-label={`Remove ${member.name}`}
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Icon icon="xmark" size="xs" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="create-group-modal__actions">
            <button
              type="button"
              className="create-group-modal__btn create-group-modal__btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-group-modal__btn create-group-modal__btn--primary"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
