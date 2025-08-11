'use client'

import { useState } from 'react'
import { Plus, User, Share2, Copy, Check } from 'lucide-react'
import { useMembers, useAddMember } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addMemberSchema, type AddMemberInput } from '@/lib/types'
import { toast } from 'sonner'
import dayjs from 'dayjs'

interface MembersTabProps {
  groupId: string
}

export function MembersTab({ groupId }: MembersTabProps) {
  const { data: members, isLoading } = useMembers(groupId)
  const addMember = useAddMember()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [isLoadingInviteCode, setIsLoadingInviteCode] = useState(false)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AddMemberInput>({
    resolver: zodResolver(addMemberSchema)
  })

  const onSubmit = async (data: AddMemberInput) => {
    try {
      await addMember(groupId, data)
      toast.success('Member added successfully!')
      setIsDialogOpen(false)
      reset()
    } catch (error) {
      toast.error('Failed to add member')
    }
  }

  const fetchInviteCode = async () => {
    setIsLoadingInviteCode(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/invite`)
      const data = await response.json()
      
      if (response.ok) {
        setInviteCode(data.inviteCode)
        setIsInviteDialogOpen(true)
      } else {
        toast.error('Failed to get invite code')
      }
    } catch (error) {
      toast.error('Failed to get invite code')
    } finally {
      setIsLoadingInviteCode(false)
    }
  }

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      toast.success('Invite code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy invite code')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Members ({members?.length || 0})</h2>
        <div className="flex space-x-2">
          <Button
            onClick={fetchInviteCode}
            disabled={isLoadingInviteCode}
            variant="outline"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {isLoadingInviteCode ? 'Loading...' : 'Invite Members'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Member Name
                  </label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Enter member name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Member'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {members?.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No members yet</h3>
          <p className="text-muted-foreground mb-4">
            Add members to start splitting expenses
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Added {dayjs(member.createdAt).format('MMM D, YYYY')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Members Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this invite code with others to let them join your group:
            </p>
            <div className="flex items-center space-x-2">
              <Input
                value={inviteCode}
                readOnly
                className="font-mono text-lg text-center"
              />
              <Button
                onClick={copyInviteCode}
                variant="outline"
                size="sm"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Others can use this code on the homepage to join your group
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setIsInviteDialogOpen(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
