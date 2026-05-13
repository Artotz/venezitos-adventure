import { useState } from "react";
import { GameCanvas } from "./game/GameCanvas";
import { useGamepadKeyboardBridge } from "./game/gamepadInput";
import { Phase1Canvas } from "./game/Phase1Canvas";
import { Phase2Canvas } from "./game/Phase2Canvas";
import "./styles.css";

function App() {
  useGamepadKeyboardBridge(true);
  const [activeView, setActiveView] = useState<
    "phase1" | "phase2" | "editor"
  >("phase1");
  const isPhaseView = activeView !== "editor";

  return (
    <main className={`app-shell${isPhaseView ? " is-phase1" : ""}`}>
      {/* <section className="game-panel"> */}
      {/* <div className="panel-header">
          <div>
            <p className="eyebrow">Venezito Adventure</p>
          </div>
        </div> */}

      <div className={`game-stage${isPhaseView ? " is-phase1" : ""}`}>
        <div className={`view-content${isPhaseView ? " is-phase1" : ""}`}>
          {activeView === "phase1" ? (
            <Phase1Canvas
              activeView={activeView}
              onChangeView={setActiveView}
            />
          ) : activeView === "phase2" ? (
            <Phase2Canvas onChangeView={setActiveView} />
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
