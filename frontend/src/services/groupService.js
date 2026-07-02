import { getAuthHeaders } from "../utils/authStorage.js";

export const USE_MOCK_GROUPS = true;

async function parseJson(response) {
  return response.json();
}

export async function fetchGroups(userId) {
  const response = await fetch(`/api/v1/groups?userId=${userId}`, {
    headers: getAuthHeaders(),
  });
  return parseJson(response);
}

export async function fetchGroupById(groupId) {
  const response = await fetch(`/api/v1/groups/${groupId}`, {
    headers: getAuthHeaders(),
  });
  return parseJson(response);
}

export async function createGroup({ name, description, userId }) {
  const response = await fetch("/api/v1/groups", {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      name,
      description: description || null,
      userId,
    }),
  });

  return parseJson(response);
}

export async function fetchGroupMembers(groupId) {
  const response = await fetch(`/api/v1/groups/${groupId}/members`, {
    headers: getAuthHeaders(),
  });
  return parseJson(response);
}

export async function sendGroupInvite(groupId, { email, username, role }) {
  const response = await fetch(`/api/v1/groups/${groupId}/invite`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      email,
      username,
      role,
    }),
  });

  return parseJson(response);
}

export async function fetchUsers() {
  const response = await fetch("/api/v1/users", {
    headers: getAuthHeaders(),
  });
  return parseJson(response);
}

export async function removeGroupMember(groupId, memberId) {
  const response = await fetch(`/api/v1/groups/${groupId}/members/${memberId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseJson(response);
}
