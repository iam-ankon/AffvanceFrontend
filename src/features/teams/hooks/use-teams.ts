import { teamsApi } from '@/lib/api/teams';
import type {
  AcceptInvitationPayload,
  CreateInvitationPayload,
  DeclineInvitationPayload,
  TransferOwnershipPayload,
  UpdateMemberRolePayload,
} from '@/types/team';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query keys
const keys = {
  myTeam: ['my-team'] as const,
  members: (teamId: string) => ['team-members', teamId] as const,
  invitations: (teamId: string) => ['team-invitations', teamId] as const,
};

export function useMyTeam() {
  return useQuery({
    queryKey: keys.myTeam,
    queryFn: teamsApi.getMyTeam,
    retry: false,
  });
}

export function useTeamMembers(teamId: string | undefined) {
  return useQuery({
    queryKey: keys.members(teamId!),
    queryFn: () => teamsApi.getMembers(teamId!),
    enabled: !!teamId,
  });
}

export function useTeamInvitations(teamId: string | undefined) {
  return useQuery({
    queryKey: keys.invitations(teamId!),
    queryFn: () => teamsApi.getInvitations(teamId!),
    enabled: !!teamId,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: CreateInvitationPayload }) =>
      teamsApi.createInvitation(teamId, data),
    onSuccess: (_, variables) => {
      toast.success('Invitation sent successfully');
      queryClient.invalidateQueries({ queryKey: keys.invitations(variables.teamId) });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send invitation');
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => teamsApi.removeMember(memberId),
    onSuccess: () => {
      toast.success('Member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: keys.myTeam });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove member');
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: UpdateMemberRolePayload }) =>
      teamsApi.updateMemberRole(memberId, data),
    onSuccess: () => {
      toast.success('Member role updated');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });
}

export function useLeaveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => teamsApi.leaveTeam(),
    onSuccess: () => {
      toast.success('You have left the team');
      queryClient.invalidateQueries({ queryKey: keys.myTeam });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to leave team');
    },
  });
}

export function useTransferOwnership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferOwnershipPayload) => teamsApi.transferOwnership(data),
    onSuccess: () => {
      toast.success('Ownership transferred successfully');
      queryClient.invalidateQueries({ queryKey: keys.myTeam });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to transfer ownership');
    },
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (data: AcceptInvitationPayload) => teamsApi.acceptInvitation(data),
    onError: (error) => {
      toast.error(error.message || 'Failed to accept invitation');
    },
  });
}

export function useDeclineInvitation() {
  return useMutation({
    mutationFn: (data: DeclineInvitationPayload) => teamsApi.declineInvitation(data),
    onError: (error) => {
      toast.error(error.message || 'Failed to decline invitation');
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => teamsApi.cancelInvitation(invitationId),
    onSuccess: () => {
      toast.success('Invitation cancelled');
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel invitation');
    },
  });
}
