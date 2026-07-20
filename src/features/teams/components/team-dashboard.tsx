'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useLeaveTeam,
  useMyTeam,
  useRemoveMember,
  useTeamMembers,
  useTransferOwnership,
  useUpdateMemberRole,
} from '@/features/teams/hooks/use-teams';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { TeamMember } from '@/types/team';
import { Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { InviteMemberDialog } from './invite-member-dialog';
import { PendingInvitations } from './pending-invitations';

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  editor: 'outline',
  member: 'outline',
  viewer: 'outline',
};

export function TeamDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: team, isLoading } = useMyTeam();
  const { data: members } = useTeamMembers(team?.id);
  const removeMember = useRemoveMember();
  const updateRole = useUpdateMemberRole();
  const leaveTeam = useLeaveTeam();
  const transferOwnership = useTransferOwnership();
  const [transferEmail, setTransferEmail] = useState('');
  const [transferOpen, setTransferOpen] = useState(false);

  const currentUserMember = members?.find(
    (m: TeamMember) => m.user_email === user?.email
  );
  const isOwner = currentUserMember?.role === 'owner';
  const isAdminOrOwner = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin';

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // No team state
  if (!team) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No Team</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
            You are not part of any team. Team subscriptions allow sharing credits and collaborating
            with team members.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{team.name}</CardTitle>
            <CardDescription>{team.description || 'No description'}</CardDescription>
          </div>
          <Badge variant="secondary">{team.member_count} members</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            Owner: <span className="text-foreground font-medium">{team.owner_email}</span>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Members</CardTitle>
          {isAdminOrOwner && <InviteMemberDialog teamId={team.id} />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {isAdminOrOwner && <TableHead className="w-[140px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(members as TeamMember[] | undefined)?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.user_name} {member.user_last_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {member.user_email}
                  </TableCell>
                  <TableCell>
                    {isAdminOrOwner && member.role !== 'owner' ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          updateRole.mutate({
                            memberId: member.id,
                            data: { role: value as 'admin' | 'editor' | 'member' | 'viewer' },
                          })
                        }
                      >
                        <SelectTrigger className="h-7 w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={roleBadgeVariant[member.role] ?? 'outline'}>
                        {member.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </TableCell>
                  {isAdminOrOwner && (
                    <TableCell>
                      {member.role !== 'owner' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive text-xs">
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.user_email} from the team?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground"
                                onClick={() => removeMember.mutate(member.id)}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {isAdminOrOwner && <PendingInvitations teamId={team.id} />}

      {/* Team Actions */}
      <div className="flex flex-wrap gap-2">
        {/* Leave Team (non-owners) */}
        {!isOwner && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Leave Team</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave Team</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to leave this team? You will lose access to shared credits
                  and resources.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Stay</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    leaveTeam.mutate(undefined, {
                      onSuccess: () => router.push('/app'),
                    });
                  }}
                >
                  Leave Team
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Transfer Ownership (owner only) */}
        {isOwner && (
          <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Transfer Ownership</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfer Ownership</DialogTitle>
                <DialogDescription>
                  Enter the email of the team member who will become the new owner.
                </DialogDescription>
              </DialogHeader>
              <Input
                type="email"
                placeholder="new-owner@example.com"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setTransferOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    transferOwnership.mutate(
                      { new_owner_email: transferEmail },
                      {
                        onSuccess: () => {
                          setTransferOpen(false);
                          setTransferEmail('');
                        },
                      }
                    );
                  }}
                  disabled={!transferEmail || transferOwnership.isPending}
                >
                  {transferOwnership.isPending ? 'Transferring...' : 'Transfer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
