import { Link } from 'react-router-dom'
import { Fragment } from 'react'

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-text-tertiary">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="text-text-tertiary">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
