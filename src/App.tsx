import { useState } from "react";
import { GameCanvas } from "./game/GameCanvas";
import { Phase1Canvas } from "./game/Phase1Canvas";
import "./styles.css";

function App() {
  const [activeView, setActiveView] = useState<"phase1" | "editor">("phase1");

  return (
    <main className="app-shell">
      {/* <section className="game-panel"> */}
      {/* <div className="panel-header">
          <div>
            <p className="eyebrow">Venezito Adventure</p>
          </div>
        </div> */}

      <div className="game-stage">
        <div className="view-content">
          {activeView === "phase1" ? (
            <Phase1Canvas
              activeView={activeView}
              onChangeView={setActiveView}
            />
          ) : (
            <GameCanvas activeView={activeView} onChangeView={setActiveView} />
          )}
        </div>
      </div>
      {/* </section> */}
    </main>
  );
}

export default App;
