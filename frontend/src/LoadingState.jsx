export default function LoadingState() {
  return (
    <div className="card loading-card">
      <div className="spinner" />
      <p className="loading-text">Analyzing your resume…</p>
      <p className="loading-subtext">
        Extracting text, matching skills, computing similarity. This can take 10–20 seconds the first time.
      </p>
    </div>
  )
}