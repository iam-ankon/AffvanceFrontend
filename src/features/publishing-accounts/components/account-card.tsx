'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { PublishingAccount } from '@/types/publishing';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MoreVertical,
  Pencil,
  PlugZap,
  Trash2,
  User,
  XCircle
} from 'lucide-react';
import {
  useTestConnection
} from '../hooks/use-publishing-accounts';

interface AccountCardProps {
  account: PublishingAccount;
  onEdit: (account: PublishingAccount) => void;
  onDelete: (account: PublishingAccount) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const testConnection = useTestConnection();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-600 dark:text-emerald-400',
          bgColor: 'bg-primary',
          badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40',
          label: 'Connected'
        };
      case 'disconnected':
        return {
          icon: XCircle,
          color: 'text-gray-500 dark:text-gray-400',
          bgColor: 'bg-gray-400',
          badgeBg: 'bg-gray-100 dark:bg-gray-800',
          label: 'Disconnected'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-500',
          badgeBg: 'bg-red-100 dark:bg-red-900/40',
          label: 'Error'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-400',
          badgeBg: 'bg-gray-100',
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(account.status);
  const StatusIcon = statusConfig.icon;

  const handleTestConnection = () => {
    testConnection.mutate(account.id);
  };

  const isAnyLoading = testConnection.isPending;

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-lg">
      {/* Status Indicator Bar */}
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-1 transition-all duration-300',
          statusConfig.bgColor
        )}
      />

      <CardHeader className="pb-3 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-semibold">{account.account_name}</h3>
              {account.platform_type === 'wordpress' && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  WordPress
                </Badge>
              )}
              {account.platform_type === 'blogger' && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  Blogger
                </Badge>
              )}
              {account.platform_type === 'devto' && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  Dev.to
                </Badge>
              )}
            </div>
            <a
              href={account.site_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary',
                !account.site_url && 'pointer-events-none opacity-60'
              )}
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {account.site_url ||
                  (account.platform_type === 'devto' && account.username
                    ? `https://dev.to/${account.username}`
                    : 'No site URL')}
              </span>
            </a>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(account)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(account)}
                className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pl-5">
        {/* User & Status Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="truncate">{account.username}</span>
          </div>

          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-1.5 border-0 px-2.5 py-1',
              statusConfig.badgeBg,
              statusConfig.color
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{statusConfig.label}</span>
          </Badge>
        </div>

        {/* Error Message */}
        {account.error_message && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-xs text-red-600 dark:text-red-400">
              {account.error_message}
            </p>
          </div>
        )}



        {/* Last Tested */}
        {account.last_tested_at && (
          <p className="text-xs text-muted-foreground">
            Last tested:{' '}
            {new Date(account.last_tested_at).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </p>
        )}
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="border-t bg-muted/30 px-4 py-3">
        <TooltipProvider delayDuration={0}>
          <div className="flex w-full items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={isAnyLoading}
                  className="flex-1 gap-1.5"
                >
                  {testConnection.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <PlugZap className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">Test Site Connection</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Test Site Connection</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
