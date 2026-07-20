import { api } from './client';
import type {
  Team,
  TeamMember,
  TeamInvitation,
  CreateInvitationPayload,
  AcceptInvitationPayload,
  DeclineInvitationPayload,
  UpdateMemberRolePayload,
  TransferOwnershipPayload,
} from '@/types/team';

// Backend response wrappers
interface PaginatedResponse<T> {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    results: T[];
  };
}

interface DetailResponse<T> {
  status_code: number;
  success: boolean;
  message: string;
  data: T;
}

const ENDPOINTS = {
  TEAMS: '/teams/',
  TEAM_DETAIL: (id: string) => `/teams/${id}/`,
  MY_TEAM: '/teams/my-team/',
  SWITCH_TEAM: (id: string) => `/teams/${id}/switch/`,
  LEAVE_TEAM: '/teams/leave/',
  TRANSFER_OWNERSHIP: '/teams/transfer-ownership/',
  MEMBERS: (teamId: string) => `/teams/${teamId}/members/`,
  MEMBER_DETAIL: (id: string) => `/teams/members/${id}/`,
  UPDATE_ROLE: (memberId: string) => `/teams/members/${memberId}/update-role/`,
  INVITATIONS: (teamId: string) => `/teams/${teamId}/invitations/`,
  INVITATION_DETAIL: (id: string) => `/teams/invitations/${id}/`,
  INVITATION_DETAILS_BY_TOKEN: (token: string) => `/teams/invitations/${token}/details/`,
  ACCEPT_INVITATION: '/teams/invitations/accept/',
  DECLINE_INVITATION: '/teams/invitations/decline/',
};

export const teamsApi = {
  // Team management
  getTeams: async (): Promise<Team[]> => {
    const response = await api.get<PaginatedResponse<Team>>(ENDPOINTS.TEAMS);
    return response.data.results;
  },

  getTeam: async (id: string): Promise<Team> => {
    const response = await api.get<DetailResponse<Team>>(ENDPOINTS.TEAM_DETAIL(id));
    return response.data;
  },

  getMyTeam: async (): Promise<Team | null> => {
    try {
      const response = await api.get<DetailResponse<Team>>(ENDPOINTS.MY_TEAM);
      return response.data;
    } catch (error) {
      const apiError = error as { status?: number };
      if (apiError.status === 404) return null;
      throw error;
    }
  },

  switchTeam: async (id: string): Promise<{ team_id: string; team_name: string; role: string }> => {
    const response = await api.post<DetailResponse<{ team_id: string; team_name: string; role: string }>>(ENDPOINTS.SWITCH_TEAM(id));
    return response.data;
  },

  leaveTeam: async (): Promise<{ detail: string }> => {
    return api.post(ENDPOINTS.LEAVE_TEAM);
  },

  transferOwnership: async (data: TransferOwnershipPayload): Promise<{ detail: string }> => {
    return api.post(ENDPOINTS.TRANSFER_OWNERSHIP, data);
  },

  // Members
  getMembers: async (teamId: string): Promise<TeamMember[]> => {
    const response = await api.get<PaginatedResponse<TeamMember>>(ENDPOINTS.MEMBERS(teamId));
    return response.data.results;
  },

  removeMember: async (id: string): Promise<void> => {
    return api.delete(ENDPOINTS.MEMBER_DETAIL(id));
  },

  updateMemberRole: async (memberId: string, data: UpdateMemberRolePayload): Promise<TeamMember> => {
    const response = await api.patch<DetailResponse<TeamMember>>(ENDPOINTS.UPDATE_ROLE(memberId), data);
    return response.data;
  },

  // Invitations
  getInvitations: async (teamId: string): Promise<TeamInvitation[]> => {
    const response = await api.get<PaginatedResponse<TeamInvitation>>(ENDPOINTS.INVITATIONS(teamId));
    return response.data.results;
  },

  createInvitation: async (teamId: string, data: CreateInvitationPayload): Promise<TeamInvitation> => {
    const response = await api.post<DetailResponse<TeamInvitation>>(ENDPOINTS.INVITATIONS(teamId), data);
    return response.data;
  },

  cancelInvitation: async (id: string): Promise<void> => {
    return api.delete(ENDPOINTS.INVITATION_DETAIL(id));
  },

  getInvitationDetails: async (token: string): Promise<TeamInvitation> => {
    const response = await api.get<DetailResponse<TeamInvitation>>(ENDPOINTS.INVITATION_DETAILS_BY_TOKEN(token));
    return response.data;
  },

  acceptInvitation: async (data: AcceptInvitationPayload): Promise<{ detail: string }> => {
    return api.post(ENDPOINTS.ACCEPT_INVITATION, data);
  },

  declineInvitation: async (data: DeclineInvitationPayload): Promise<{ detail: string }> => {
    return api.post(ENDPOINTS.DECLINE_INVITATION, data);
  },
};
