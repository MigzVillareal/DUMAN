import { createContext, useContext, useState } from "react";
import { INITIAL_GROUPS, slugifyGroupName } from "../data/groupsMock.js";

const GroupsContext = createContext(null);

export function GroupsProvider({ children }) {
  const [groups, setGroups] = useState(INITIAL_GROUPS);

  const addGroup = (name) => {
    const trimmed = name.trim();
    const id = slugifyGroupName(trimmed);
    const newGroup = { id, name: trimmed, description: "" };
    setGroups((prev) => [...prev, newGroup]);
    return newGroup;
  };

  return (
    <GroupsContext.Provider value={{ groups, addGroup }}>
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
