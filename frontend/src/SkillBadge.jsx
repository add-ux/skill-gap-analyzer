export default function SkillBadge({ label, variant = 'default', similarity }) {
  const className = `badge badge-${variant}`

  return (
    <span className={className} title={similarity ? `Similarity: ${similarity}` : undefined}>
      {label}
      {typeof similarity === 'number' && (
        <span className="badge-similarity">{Math.round(similarity * 100)}%</span>
      )}
    </span>
  )
}