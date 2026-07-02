import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { INITIAL_GROUPS, slugifyGroupName } from "../data/groupsMock.js";
import {
  USE_MOCK_GROUPS,
  createGroup,
  fetchGroups,
  sendGroupInvite,
} from "../services/groupService.js";
import { buildGroupMembers, mapApiGroup } from "../utils/groups.js";
import { useAuth } from "./AuthContext.jsx";

const GroupsContext = createContext(null);

function createLocalGroup(prevGroups, { name, description, members, user }) {
  const trimmedName = name.trim();
  const baseId = slugifyGroupName(trimmedName);
  const existingIds = new Set(prevGroups.map((group) => group.id));
  let id = baseId;
  let suffix = 2;

  while (existingIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return {
    id,
    name: trimmedName,
    description: description.trim(),
    members: buildGroupMembers(user, members),
  };
}

export function GroupsProvider({ children }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState(
    USE_MOCK_GROUPS ? INITIAL_GROUPS : []
  );
  const [loading, setLoading] = useState(!USE_MOCK_GROUPS);
  const [error, setError] = useState(null);

  const loadGroups = useCallback(async () => {
    if (USE_MOCK_GROUPS) {
      setLoading(false);
      setError(null);
      return;
    }

    if (!user?.userId) {
      setGroups([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchGroups(user.userId);

      if (data.errorMessage) {
        setError(data.errorMessage);
        setGroups([]);
        return;
      }

      setGroups((data.groups ?? []).map(mapApiGroup));
    } catch {
      setError("Unable to reach the server.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const addGroup = async ({ name, description = "", members = [] }) => {
    if (USE_MOCK_GROUPS) {
      let newGroup;

      setGroups((prev) => {
        newGroup = createLocalGroup(prev, {
          name,
          description,
          members,
          user,
        });
        return [...prev, newGroup];
      });

      return newGroup;
    }

    const data = await createGroup({
      name,
      description,
      userId: user?.userId,
    });

    if (data.errorMessage) {
      throw new Error(data.errorMessage);
    }

    const created = mapApiGroup(data.group);
    const displayMembers = buildGroupMembers(user, members);
    const newGroup = { ...created, members: displayMembers };

    if (user?.userId) {
      for (const member of members) {
        try {
          await sendGroupInvite(created.groupId, {
            email: member.email,
          });
        } catch {
          // Invite endpoint may fail until backend fixes land.
        }
      }
    }

    setGroups((prev) => [...prev, newGroup]);
    return newGroup;
  };

  const setGroupMembers = useCallback((targetGroupId, nextMembers) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === targetGroupId
          ? { ...group, members: nextMembers }
          : group
      )
    );
  }, []);

  return (
    <GroupsContext.Provider
      value={{ groups, addGroup, setGroupMembers, loading, error, loadGroups }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  const ctx = useContext(GroupsContext);
  if (!ctx) {
    throw new Error("useGroups must be used within GroupsProvider");
  }
  return ctx;
}
