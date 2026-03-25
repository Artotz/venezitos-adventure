import { useState } from "react";
import { GameCanvas } from "./game/GameCanvas";
import { Phase1Canvas } from "./game/Phase1Canvas";
import "./styles.css";

function App() {
  const [activeView, setActiveView] = useState<"phase1" | "editor">("phase1");
  const isPhase1View = activeView === "phase1";

  return (
    <main className={`app-shell${isPhase1View ? " is-phase1" : ""}`}>
      {/* <section className="game-panel"> */}
      {/* <div className="panel-header">
          <div>
            <p className="eyebrow">Venezito Adventure</p>
          </div>
        </div> */}

      <div className={`game-stage${isPhase1View ? " is-phase1" : ""}`}>
        <div className={`view-content${isPhase1View ? " is-phase1" : ""}`}>
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
