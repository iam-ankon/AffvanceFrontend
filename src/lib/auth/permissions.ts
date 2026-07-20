export type User = { roles: Role[]; id: string };

type Role = keyof typeof ROLES;
type Permission = (typeof ROLES)[Role][number];

const ROLES = {
  agency: ['manage:agency'],
  author: ['manage:user'],
  admin: ['manage:user']
} as const;

function isRole(role: string): role is Role {
  return role in ROLES;
}

export function hasPermission(user: User, permission: Permission) {
  const roles = user.roles ?? [];
  return roles.some((role) => {
    if (!isRole(role)) return false;
    const perms = ROLES[role] as readonly Permission[];
    return perms.includes(permission);
  });
}
