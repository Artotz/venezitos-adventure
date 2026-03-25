type Phase1SidebarProps = {
  score: number
  distance: number
}

export function Phase1Sidebar({ score, distance }: Phase1SidebarProps) {
  return (
    <div className="phase-sidebar">
      <div className="phase-card phase-stats">
        <div>
          <span className="stat-label">Pontuacao</span>
          <strong>{score}</strong>
        </div>
        <div>
          <span className="stat-label">Distancia</span>
          <strong>{Math.floor(distance / 10)} m</strong>
        </div>
      </div>
    </div>
  )
}
