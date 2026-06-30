export const USE_MOCK_GROUPS = true;

async function parseJson(response) {
  return response.json();
}

export async function fetchGroups(userId) {
  const response = await fetch(`/api/v1/groups?userId=${userId}`);
  return parseJson(response);
}

export async function fetchGroupById(groupId) {
  const response = await fetch(`/api/v1/groups/${groupId}`);
  return parseJson(response);
}

export async function createGroup({ name, description, userId }) {
  const response = await fetch("/api/v1/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      description: description || null,
      userId,
    }),
  });

  return parseJson(response);
}

export async function fetchGroupMembers(groupId) {
  const response = await fetch(`/api/v1/groups/${groupId}/members`);
  return parseJson(response);
}

export async function sendGroupInvite(groupId, { userId, invitedBy }) {
  const response = await fetch(`/api/v1/groups/${groupId}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      InvitedBy: invitedBy,
    }),
  });

  return parseJson(response);
}

export async function fetchUsers() {
  const response = await fetch("/api/v1/users");
  return parseJson(response);
}
