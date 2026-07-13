export default function PlayerDock() {
  return <aside className="player-dock" aria-label="Media player preview">
    <div className="player-art" aria-hidden>◇</div>
    <div className="player-copy"><strong>Signal &amp; Systems</strong><span>Cryptic Design Audio</span><em>Playing</em></div>
    <div className="player-transport"><div className="player-track"><i /></div><div className="player-buttons"><button aria-label="Previous">‹</button><button className="player-pause" aria-label="Pause">Ⅱ</button><button aria-label="Next">›</button></div></div>
    <div className="player-tools" aria-hidden>⌁ &nbsp; ≡ &nbsp; ⛶</div>
  </aside>;
}
