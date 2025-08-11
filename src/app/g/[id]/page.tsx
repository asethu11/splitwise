'use client'

import { useParams } from 'next/navigation'
import { useGroup } from '@/lib/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpensesTab } from '@/components/ExpensesTab'
import { BalancesTab } from '@/components/BalancesTab'
import { SettleUpTab } from '@/components/SettleUpTab'
import { MembersTab } from '@/components/MembersTab'
import { ExportTab } from '@/components/ExportTab'

export default function GroupDetailPage() {
  const params = useParams()
  const groupId = params.id as string
  const { data: group, isLoading, error } = useGroup(groupId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Group not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{group.name}</h1>
        {group.description && (
          <p className="text-muted-foreground mt-2">{group.description}</p>
        )}
      </div>

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="settle">Settle Up</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <ExpensesTab groupId={groupId} />
        </TabsContent>

        <TabsContent value="balances">
          <BalancesTab groupId={groupId} />
        </TabsContent>

        <TabsContent value="settle">
          <SettleUpTab groupId={groupId} />
        </TabsContent>

        <TabsContent value="members">
          <MembersTab groupId={groupId} />
        </TabsContent>

        <TabsContent value="export">
          <ExportTab groupId={groupId} groupName={group.name} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
