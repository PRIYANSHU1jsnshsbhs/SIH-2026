import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuditLog, useManagedUsers, useSetUserActive, useSystemStatus, useUpdateUserRole } from '@/hooks/useAdmin'
import { useCases, useUpdateCase } from '@/hooks/useCases'
import { LoadingState } from '@/components/common/LoadingState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useUiStore } from '@/stores/uiStore'
import type { Role } from '@/schemas/auth'
import type { CasePriority, CaseStatus } from '@/schemas/cases'
import clsx from 'clsx'

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-block h-2 w-2 rounded-full',
        status === 'healthy' && 'bg-green-500',
        status === 'degraded' && 'bg-amber-500',
        status === 'down' && 'bg-red-500',
      )}
    />
  )
}

function CaseOversightSection() {
  const cases = useCases()
  const updateCase = useUpdateCase()
  const pushToast = useUiStore((s) => s.pushToast)
  const [closeTarget, setCloseTarget] = useState<string | null>(null)

  return (
    <section>
      <h2 className="text-sm font-semibold text-text-primary mb-3">Case oversight</h2>
      {cases.isLoading ? (
        <LoadingState />
      ) : (
        <div className="overflow-x-auto rounded-lg bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-c bg-surface-2 text-xs uppercase text-text-tertiary">
                <th className="px-3 py-2 font-medium">Case</th>
                <th className="px-3 py-2 font-medium">Priority</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.data?.cases.map((c) => (
                <tr key={c.case_id} className="border-b border-border-c/70">
                  <td className="px-3 py-2">
                    <Link to={`/cases/${c.case_id}`} className="text-accent hover:underline underline-offset-2">
                      {c.title}
                    </Link>
                    <span className="ml-2 text-xs text-text-tertiary">{c.case_id}</span>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={c.priority}
                      disabled={updateCase.isPending}
                      onChange={(e) => {
                        updateCase.mutate(
                          { caseId: c.case_id, input: { priority: e.target.value as CasePriority } },
                          { onSuccess: () => pushToast(`Priority updated for ${c.case_id}`, 'success') },
                        )
                      }}
                      className="rounded-md bg-surface-2 px-2 py-1 text-xs text-text-primary"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 capitalize text-text-secondary">{c.status.replace('_', ' ')}</td>
                  <td className="px-3 py-2">
                    {c.status !== 'closed' && (
                      <button
                        onClick={() => setCloseTarget(c.case_id)}
                        className="text-xs px-2.5 py-1 rounded-md bg-surface-2 text-text-primary hover:brightness-125"
                      >
                        Force close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!closeTarget}
        title={`Force close ${closeTarget}?`}
        description="This marks the case closed regardless of its current investigation state. Use for cases that should no longer accept new activity."
        confirmLabel="Force close"
        danger
        onCancel={() => setCloseTarget(null)}
        onConfirm={() => {
          if (closeTarget) {
            updateCase.mutate(
              { caseId: closeTarget, input: { status: 'closed' as CaseStatus } },
              { onSuccess: () => pushToast(`${closeTarget} closed`, 'success') },
            )
          }
          setCloseTarget(null)
        }}
      />
    </section>
  )
}

function UserManagementSection() {
  const users = useManagedUsers()
  const setUserActive = useSetUserActive()
  const updateUserRole = useUpdateUserRole()
  const pushToast = useUiStore((s) => s.pushToast)
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: string; username: string } | null>(null)

  return (
    <section>
      <h2 className="text-sm font-semibold text-text-primary mb-3">User management</h2>
      {users.isLoading ? (
        <LoadingState />
      ) : (
        <div className="overflow-x-auto rounded-lg bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-c bg-surface-2 text-xs uppercase text-text-tertiary">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Username</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.data?.map((u) => (
                <tr key={u.id} className="border-b border-border-c/70">
                  <td className="px-3 py-2 text-text-primary">{u.name}</td>
                  <td className="px-3 py-2 font-mono text-xs text-text-secondary">{u.username}</td>
                  <td className="px-3 py-2">
                    <select
                      value={u.role}
                      disabled={updateUserRole.isPending}
                      onChange={(e) => {
                        updateUserRole.mutate(
                          { userId: u.id, role: e.target.value as Role },
                          { onSuccess: () => pushToast(`Role updated for ${u.username}`, 'success') },
                        )
                      }}
                      className="rounded-md bg-surface-2 px-2 py-1 text-xs text-text-primary"
                    >
                      <option value="investigator">investigator</option>
                      <option value="admin">admin</option>
                      <option value="devops">devops</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <span className={clsx('text-xs font-semibold uppercase', u.active ? 'text-green-400' : 'text-text-tertiary')}>
                      {u.active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {u.active ? (
                      <button
                        onClick={() => setDeactivateTarget({ id: u.id, username: u.username })}
                        className="text-xs px-2.5 py-1 rounded-md bg-amber-950/50 text-amber-300 hover:bg-amber-900/60"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          setUserActive.mutate(
                            { userId: u.id, active: true },
                            { onSuccess: () => pushToast(`${u.username} reactivated`, 'success') },
                          )
                        }
                        className="text-xs px-2.5 py-1 rounded-md bg-surface-2 text-text-primary hover:brightness-125"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deactivateTarget}
        title={`Deactivate ${deactivateTarget?.username}?`}
        description="They will no longer be able to sign in until reactivated."
        confirmLabel="Deactivate"
        danger
        onCancel={() => setDeactivateTarget(null)}
        onConfirm={() => {
          if (deactivateTarget) {
            setUserActive.mutate(
              { userId: deactivateTarget.id, active: false },
              { onSuccess: () => pushToast(`${deactivateTarget.username} deactivated`, 'success') },
            )
          }
          setDeactivateTarget(null)
        }}
      />
    </section>
  )
}

export function AdminOpsConsole() {
  const status = useSystemStatus()
  const audit = useAuditLog()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">AdminOps</h1>
        <p className="text-sm text-text-tertiary">Case oversight, user management, and system health. Admin role only.</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">System status</h2>
        {status.isLoading ? (
          <LoadingState />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {status.data &&
              Object.entries(status.data).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-surface-1 px-4 py-3">
                  <p className="text-xs text-text-tertiary capitalize">{key.replace('_', ' ')}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-text-primary">
                    <StatusDot status={value} /> {value}
                  </p>
                </div>
              ))}
          </div>
        )}
      </section>

      <CaseOversightSection />
      <UserManagementSection />

      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Audit log</h2>
        {audit.isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-1.5 font-mono text-xs text-text-secondary max-h-64 overflow-y-auto rounded-lg bg-surface-1 p-3">
            {audit.data?.map((entry) => (
              <p key={entry.id}>
                <span className="text-text-tertiary">{new Date(entry.timestamp).toLocaleString()}</span>{' '}
                <span className="text-text-primary">{entry.actor}</span> {entry.action}
                {entry.target ? ` (${entry.target})` : ''}
              </p>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
