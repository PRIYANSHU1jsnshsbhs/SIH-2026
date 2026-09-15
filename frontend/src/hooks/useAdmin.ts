import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAuditLog, fetchManagedUsers, fetchSystemStatus, setUserActiveRequest, updateUserRoleRequest } from '@/api/admin'
import type { Role } from '@/schemas/auth'

export function useSystemStatus() {
  return useQuery({ queryKey: ['admin', 'system-status'], queryFn: fetchSystemStatus, refetchInterval: 5000 })
}

export function useManagedUsers() {
  return useQuery({ queryKey: ['admin', 'users'], queryFn: fetchManagedUsers })
}

export function useAuditLog() {
  return useQuery({ queryKey: ['admin', 'audit-log'], queryFn: fetchAuditLog, refetchInterval: 4000 })
}

export function useSetUserActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) => setUserActiveRequest(userId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-log'] })
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) => updateUserRoleRequest(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-log'] })
    },
  })
}
