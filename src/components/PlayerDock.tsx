export default function PlayerDock() {
  return <aside className="player-dock" aria-label="Media player preview">
    <div className="player-art" aria-hidden>◇</div>
    <div className="player-copy"><strong>Signal &amp; Systems</strong><span>Cryptic Signal</span><em>Playing</em></div>
    <div className="player-transport"><div className="player-track" role="progressbar" aria-label="Preview progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={42}><i /></div><div className="player-buttons" aria-label="Preview controls unavailable"><button type="button" disabled aria-label="Previous, unavailable">‹</button><button type="button" disabled className="player-pause" aria-label="Pause, unavailable">Ⅱ</button><button type="button" disabled aria-label="Next, unavailable">›</button></div></div>
    <div className="player-tools" aria-hidden>⌁ &nbsp; ≡ &nbsp; ⛶</div>
  </aside>;
}
