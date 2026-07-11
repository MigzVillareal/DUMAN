export function getAuthUserDisplayName(authUser) {
  if (!authUser) return "";
  return `${authUser.firstname ?? ""} ${authUser.lastname ?? ""}`.trim();
}

export function userMatchesInvitableSearch(user, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;

  const name = user.name?.trim().toLowerCase() ?? "";
  const email = user.email?.trim().toLowerCase() ?? "";

  return name.startsWith(normalized) || email.includes(normalized);
}

export function findInvitableUserByQuery(query, users, excludedIds = []) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const blockedIds = new Set(excludedIds);
  const matches = users.filter(
    (user) => !blockedIds.has(user.id) && userMatchesInvitableSearch(user, normalized)
  );

  if (matches.length === 1) return matches[0];

  return (
    matches.find(
      (user) =>
        user.name?.trim().toLowerCase() === normalized ||
        user.email?.trim().toLowerCase() === normalized
    ) ?? null
  );
}

export function isSameAsAuthUser(candidate, authUser) {
  if (!authUser || !candidate) return false;

  if (
    authUser.userId != null &&
    candidate.id != null &&
    Number(candidate.id) === Number(authUser.userId)
  ) {
    return true;
  }

  const authEmail = authUser.email?.trim().toLowerCase();
  const candidateEmail = candidate.email?.trim().toLowerCase();
  if (authEmail && candidateEmail && authEmail === candidateEmail) {
    return true;
  }

  return false;
}

export function mapApiGroup(group) {
  return {
    id: String(group.groupId),
    groupId: group.groupId,
    name: group.name,
    description: group.description ?? "",
    userId: group.userId,
  };
}

export function mapApiUserToInvitable(user) {
  return {
    id: user.userId,
    name: `${user.firstname} ${user.lastname}`.trim(),
    email: user.email,
  };
}

export function mapApiMember(record, groupOwnerId) {
  const user = record.user;
  const isLeader =
    record.role === "ADMIN" || record.memberId === groupOwnerId;

  return {
    id: record.memberId,
    name: user
      ? `${user.firstname} ${user.lastname}`.trim()
      : `User ${record.memberId}`,
    email: user?.email ?? "",
    role: isLeader ? "leader" : "member",
  };
}

export function buildGroupMembers(user, invitedMembers = []) {
  const normalizedInvited = invitedMembers.map((member) => ({
    ...member,
    role: "member",
  }));

  if (!user) return normalizedInvited;

  const creator = {
    id: user.userId,
    name: `${user.firstname} ${user.lastname}`.trim(),
    email: user.email,
    role: "leader",
  };

  const others = normalizedInvited.filter((member) => member.id !== user.userId);

  return [creator, ...others];
}

export function mapApiInvite(record) {
  const inviter = record.invitier ?? record.inviter;
  const inviterName = inviter
    ? `${inviter.firstname} ${inviter.lastname}`.trim()
    : `User ${record.invitedBy}`;

  return {
    id: `${record.groupId}-${record.memberId}`,
    groupId: record.groupId,
    group: record.group?.name ?? `Group ${record.groupId}`,
    invitedBy: inviterName,
    role: record.role === "ADMIN" ? "Leader" : "Member",
  };
}

export function getUserGroupRoleLabel(authUser, group) {
  if (!authUser || !group) return null;

  if (
    group.userId != null &&
    Number(group.userId) === Number(authUser.userId)
  ) {
    return "Leader";
  }

  const self = group.members?.find(
    (member) => Number(member.id) === Number(authUser.userId)
  );

  if (self?.role === "leader") return "Leader";
  return "Member";
}

export function isGroupLeader(authUser, group, members = []) {
  if (!authUser || !group) return false;

  if (
    group.userId != null &&
    Number(group.userId) === Number(authUser.userId)
  ) {
    return true;
  }

  const self = members.find(
    (member) => Number(member.id) === Number(authUser.userId)
  );

  return self?.role === "leader";
}

export function canRemoveGroupMember(authUser, group, member, members = []) {
  if (!isGroupLeader(authUser, group, members)) return false;
  if (member.role === "leader") return false;
  if (Number(member.id) === Number(authUser.userId)) return false;
  return true;
}

export function ensureOwnerAsLeader(members, user, groupOwnerId) {
  if (!user || groupOwnerId !== user.userId) return members;

  const ownerExists = members.some((member) => member.id === user.userId);
  if (ownerExists) return members;

  return [
    {
      id: user.userId,
      name: `${user.firstname} ${user.lastname}`.trim(),
      email: user.email,
      role: "leader",
    },
    ...members,
  ];
}
