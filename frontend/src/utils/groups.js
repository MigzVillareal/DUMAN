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
