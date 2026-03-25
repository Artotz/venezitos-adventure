# AGENTS.md

Este repositório já tem uma separação clara por domínio. Ao editar ou criar arquivos, preserve essa organização.

## Estrutura atual

- `src/assets/retro`: sprites da retroescavadeira.
- `src/game/retro`: base compartilhada da retroescavadeira.
  - `config.ts`: camadas, limites, presets e valores base.
  - `types.ts`: tipos do domínio da retro.
  - `geometry.ts`: matrizes, bounds e transformação hierárquica.
  - `render.ts`: composição visual e desenho no canvas.
  - `animations.ts`: interpolação e pose final a partir dos presets.
  - `sprites.ts`: carregamento dos assets.
- `src/game/editor`: editor da retro.
  - componentes e hook usados só no editor (`RetroEditorSidebar`, `PoseControls`, `AnimationControls`, `EditorTabs`, `useRetroEditor`).
- `src/game/phase1`: tudo que é específico da fase 1.
  - `config.ts`, `types.ts`, `events.ts`, `render.ts`, `usePhase1Game.ts`, `Phase1Sidebar.tsx`.
- `src/game/GameCanvas.tsx`: entrada do editor.
- `src/game/Phase1Canvas.tsx`: entrada da fase jogável.
- `src/game/useGameLoop.ts`: loop compartilhado.
- `src/game/constants.ts`, `src/game/engine.ts`, `src/game/input.ts`, `src/game/types.ts`: infraestrutura compartilhada fora de um domínio específico.

## Regras para novas mudanças

- Não misture lógica de `phase1` dentro de `editor`.
- Não coloque comportamento compartilhado da retro dentro de `phase1`; mova para `src/game/retro`.
- Componentes de UI específicos de uma área devem ficar na própria pasta dessa área.
- Hooks específicos de uma área devem ficar ao lado dos componentes dessa área.
- Se surgir uma nova fase, siga o padrão `src/game/<fase>` com `config`, `types`, `render`, `events` e hook principal da fase.
- Arquivos de entrada (`GameCanvas.tsx`, `Phase1Canvas.tsx`) devem orquestrar módulos, não concentrar regras de domínio grandes.
- Prefira reaproveitar `src/game/retro/*` para manter editor e fase usando a mesma base visual e de animação.
