import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

const BASE_NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '◧' },
  { to: '/cases', label: 'Cases', icon: '▤' },
  { to: '/explorer', label: 'Explorer', icon: '◈' },
  { to: '/reports', label: 'Reports', icon: '▥' },
  { to: '/about', label: 'About', icon: '◎' },
]

function NavItem({ to, label, icon, collapsed }: { to: string; label: string; icon: string; collapsed: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          // transition-none: bg/text/height snap instantly on hover or active
          // instead of fading in, per design — the underline indicator below
          // keeps its own transition since that's declared on itself, not here.
          'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-none hover:py-2.5',
          isActive
            ? 'bg-navy-800 text-saffron font-medium py-2.5'
            : 'text-text-secondary hover:bg-navy-800 hover:text-text-inverse',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={clsx(
              'absolute left-0 top-1/2 w-0.5 -translate-y-1/2 rounded-full bg-accent transition-all duration-200',
              isActive ? 'h-5' : 'h-0',
            )}
            aria-hidden
          />
          <span aria-hidden>{icon}</span>
          {!collapsed && <span>{label}</span>}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const role = useAuthStore((s) => s.user?.role)

  const navItems = [...BASE_NAV_ITEMS]
  if (role === 'admin') navItems.push({ to: '/adminops', label: 'AdminOps', icon: '◉' })
  if (role === 'devops') navItems.push({ to: '/devops', label: 'DevOps', icon: '◆' })

  return (
    <aside className={clsx('flex shrink-0 flex-col bg-navy-900 text-text-inverse transition-all border-r border-navy-800', collapsed ? 'w-16' : 'w-56')}>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <nav className="mt-auto flex flex-col gap-1 border-t border-navy-800 p-3">
        <NavItem to="/contact" label="Contact" icon="✉" collapsed={collapsed} />
        {role === 'devops' && <NavItem to="/backend" label="Backend" icon="▧" collapsed={collapsed} />}
        <NavItem to="/terminal-commands" label="Terminal Commands" icon=">_" collapsed={collapsed} />
      </nav>
    </aside>
  )
}
