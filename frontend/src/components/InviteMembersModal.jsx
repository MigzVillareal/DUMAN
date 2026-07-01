import { useEffect, useRef, useState } from "react";
import { fetchUsers, USE_MOCK_GROUPS } from "../services/groupService.js";
import { mapApiUserToInvitable } from "../utils/groups.js";
import { INVITABLE_USERS } from "../data/groupsMock.js";
import { useAuth } from "../context/AuthContext.jsx";
import Icon from "./Icon.jsx";
import "../css/components_styles/CreateGroupModal.css";

function getMemberSuggestions(
  query,
  addedMembers,
  excludedIds,
  invitableUsers
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const blockedIds = new Set([
    ...addedMembers.map((member) => member.id),
    ...excludedIds,
  ]);

  return invitableUsers.filter(
    (user) =>
      !blockedIds.has(user.id) &&
      user.name.toLowerCase().startsWith(normalized)
  );
}

function findInvitableUser(query, addedMembers, excludedIds, invitableUsers) {
  const suggestions = getMemberSuggestions(
    query,
    addedMembers,
    excludedIds,
    invitableUsers
  );
  if (suggestions.length === 1) return suggestions[0];

  const normalized = query.trim().toLowerCase();
  return (
    suggestions.find((user) => user.name.toLowerCase() === normalized) ?? null
  );
}

export default function InviteMembersModal({
  onClose,
  onSubmit,
  existingMemberIds = [],
  submitting = false,
  submitError = "",
  submitLabel = "Send Invites",
}) {
  const { user } = useAuth();
  const [memberSearch, setMemberSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [invitableUsers, setInvitableUsers] = useState([]);
  const [memberError, setMemberError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const overlayRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchWrapRef = useRef(null);

  const excludedIds = [user?.userId, ...existingMemberIds].filter(Boolean);

  const memberSuggestions = getMemberSuggestions(
    memberSearch,
    members,
    excludedIds,
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
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, submitting]);

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
    if (event.target === overlayRef.current && !submitting) onClose();
  };

  const handleAddMember = (selectedUser) => {
    const match =
      selectedUser ??
      findInvitableUser(memberSearch, members, excludedIds, invitableUsers);

    if (!match) {
      setMemberError("No matching user found.");
      return;
    }

    if (members.some((member) => member.id === match.id)) {
      setMemberError("Member already added.");
      return;
    }

    setMembers((prev) => [...prev, match]);
    setMemberSearch("");
    setMemberError("");
    setShowSuggestions(false);
  };

  const handleRemoveMember = (memberId) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(members);
  };

  return (
    <div
      className="create-group-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-members-title"
    >
      <div className="create-group-modal">
        <form className="create-group-modal__content" onSubmit={handleSubmit}>
          <h2 id="invite-members-title" className="create-group-modal__title">
            Invite Members
          </h2>

          {submitError && (
            <p className="create-group-modal__error">{submitError}</p>
          )}

          <div className="create-group-modal__field">
            <span className="create-group-modal__label">Invite Members</span>

            <div
              className="create-group-modal__search-wrap"
              ref={searchWrapRef}
            >
              <div className="create-group-modal__invite-row">
                <input
                  ref={searchInputRef}
                  id="invite-member-search"
                  className="create-group-modal__input create-group-modal__input--search"
                  type="text"
                  placeholder="Search members..."
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
                  aria-controls="invite-member-suggestions"
                  aria-expanded={showSuggestions && Boolean(memberSearch.trim())}
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

              {showSuggestions && memberSearch.trim() && (
                <ul
                  id="invite-member-suggestions"
                  className="create-group-modal__suggestions create-group-modal__suggestions--stacked"
                  role="listbox"
                >
                  {memberSuggestions.length > 0 ? (
                    memberSuggestions.map((invitableUser) => (
                      <li key={invitableUser.id} role="none">
                        <button
                          type="button"
                          className="create-group-modal__suggestion-item"
                          role="option"
                          onClick={() => handleAddMember(invitableUser)}
                        >
                          <span className="create-group-modal__suggestion-name">
                            {invitableUser.name}
                          </span>
                          <span className="create-group-modal__suggestion-email">
                            {invitableUser.email}
                          </span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="create-group-modal__suggestion-empty" role="none">
                      No matching members found.
                    </li>
                  )}
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
                    <li
                      key={member.id}
                      className="create-group-modal__member-item"
                    >
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
              disabled={submitting || members.length === 0}
            >
              {submitting ? "Sending..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
