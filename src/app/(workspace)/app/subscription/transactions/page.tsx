'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CreditDropdown from '@/components/credit-dropdown';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { useCreditTransactions } from '@/features/subscriptions/hooks/use-subscriptions';
import type { CreditTransaction } from '@/types/subscription';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type FilterType = 'all' | 'keyword' | 'ai';
type FilterDirection = 'all' | 'usage' | 'allocation';

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useCreditTransactions();
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [directionFilter, setDirectionFilter] = useState<FilterDirection>('all');

  const filtered = (transactions as CreditTransaction[] | undefined)?.filter((tx) => {
    if (typeFilter !== 'all' && tx.credit_type !== typeFilter) return false;
    if (directionFilter === 'usage' && tx.amount >= 0) return false;
    if (directionFilter === 'allocation' && tx.amount < 0) return false;
    return true;
  });

  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center gap-2">
          <CreditDropdown />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/app/subscription">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Transaction History</h1>
              <p className="text-muted-foreground">
                Complete log of all credit allocations and usage
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Transactions</CardTitle>
              <CardDescription>
                {filtered?.length ?? 0} transaction{(filtered?.length ?? 0) !== 1 ? 's' : ''}
              </CardDescription>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="flex gap-1">
                  {(['all', 'keyword', 'ai'] as FilterType[]).map((f) => (
                    <Button
                      key={f}
                      variant={typeFilter === f ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTypeFilter(f)}
                      className="text-xs capitalize"
                    >
                      {f === 'all' ? 'All Types' : `${f} Credits`}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {(['all', 'usage', 'allocation'] as FilterDirection[]).map((f) => (
                    <Button
                      key={f}
                      variant={directionFilter === f ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDirectionFilter(f)}
                      className="text-xs capitalize"
                    >
                      {f === 'all' ? 'All' : f}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : !filtered || filtered.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No transactions found.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction Type</TableHead>
                      <TableHead>Credit Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance After</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {tx.transaction_type.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={tx.credit_type === 'ai' ? 'secondary' : 'outline'}
                            className="text-xs capitalize"
                          >
                            {tx.credit_type}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            tx.amount < 0 ? 'text-red-500' : 'text-green-600'
                          }`}
                        >
                          {tx.amount > 0 ? '+' : ''}
                          {tx.amount}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right text-xs">
                          {tx.balance_after}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {tx.subscription_plan}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[250px] truncate text-xs">
                          {tx.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  );
}