// Team member
export interface TeamMember {
  id: string;
  user: number;
  user_email: string;
  user_name: string;
  user_last_name: string;
  role: 'owner' | 'admin' | 'editor' | 'member' | 'viewer';
  is_active: boolean;
  joined_at: string;
  updated_at: string;
}

// Team
export interface Team {
  id: string;
  name: string;
  description: string | null;
  owner: number;
  owner_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  members: TeamMember[];
  member_count: number;
}

// Team invitation
export interface TeamInvitation {
  id: string;
  team: string;
  team_name: string;
  invited_by: number;
  invited_by_email: string;
  email: string;
  role: 'admin' | 'editor' | 'member' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  is_expired: boolean;
  is_pending: boolean;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
}

// Payloads
export interface CreateInvitationPayload {
  team: string;
  email: string;
  role: 'admin' | 'editor' | 'member' | 'viewer';
}

export interface AcceptInvitationPayload {
  token: string;
}

export interface DeclineInvitationPayload {
  token: string;
}

export interface UpdateMemberRolePayload {
  role: 'admin' | 'editor' | 'member' | 'viewer';
}

export interface TransferOwnershipPayload {
  new_owner_email: string;
}
