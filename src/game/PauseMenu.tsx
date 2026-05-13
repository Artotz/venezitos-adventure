import { useEffect, useMemo, useState } from "react";
import {
  isMenuConfirmCode,
  isMenuDownCode,
  isMenuLeftCode,
  isMenuRightCode,
  isMenuUpCode,
} from "./gamepadInput";
import { TEXT } from "./i18n";
import type { Phase1ControlScheme } from "./phase1/controls";

type PauseMenuProps = {
  onResume: () => void;
  onOpenMainMenu: () => void;
  controlScheme?: Phase1ControlScheme;
  onToggleControlScheme?: () => void;
};

export function PauseMenu({
  onResume,
  onOpenMainMenu,
  controlScheme,
  onToggleControlScheme,
}: PauseMenuProps) {
  const actions = useMemo(
    () =>
      [
        controlScheme && onToggleControlScheme
          ? { id: "toggle-controls", handler: onToggleControlScheme }
          : null,
        { id: "resume", handler: onResume },
        { id: "main-menu", handler: onOpenMainMenu },
      ].filter(Boolean) as Array<{ id: string; handler: () => void }>,
    [controlScheme, onOpenMainMenu, onResume, onToggleControlScheme],
  );
  const [selectedActionIndex, setSelectedActionIndex] = useState(0);

  useEffect(() => {
    setSelectedActionIndex((current) =>
      Math.min(current, Math.max(0, actions.length - 1)),
    );
  }, [actions.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (
        isMenuUpCode(event.code) ||
        isMenuLeftCode(event.code) ||
        isMenuDownCode(event.code) ||
        isMenuRightCode(event.code)
      ) {
        event.preventDefault();
        const direction =
          isMenuUpCode(event.code) || isMenuLeftCode(event.code) ? -1 : 1;
        setSelectedActionIndex((current) =>
          (current + direction + actions.length) % actions.length,
        );
        return;
      }

      if (isMenuConfirmCode(event.code)) {
        event.preventDefault();
        actions[selectedActionIndex]?.handler();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [actions, selectedActionIndex]);

  const isSelected = (id: string) =>
    actions[selectedActionIndex]?.id === id ? " is-selected" : "";

  return (
    <div className="phase-pause-overlay" role="dialog" aria-modal="true">
      <div className="phase-pause-menu">
        <p className="phase-pause-eyebrow">{TEXT.pauseMenu.eyebrow}</p>
        <h2>{TEXT.pauseMenu.title}</h2>
        {controlScheme && onToggleControlScheme ? (
          <div className="phase-control-toggle">
            <div>
              <span>{TEXT.pauseMenu.controls}</span>
              <strong>{controlScheme.name}</strong>
              <small>
                {controlScheme.driveSummary}. {controlScheme.eventSummary}.
              </small>
            </div>
            <button
              type="button"
              className={`phase-secondary-button${isSelected("toggle-controls")}`}
              onClick={onToggleControlScheme}
            >
              {TEXT.pauseMenu.toggle}
            </button>
          </div>
        ) : null}
        <div className="phase-pause-actions">
          <button
            type="button"
            className={`phase-primary-button${isSelected("resume")}`}
            onClick={onResume}
          >
            {TEXT.pauseMenu.resume}
          </button>
          <button
            type="button"
            className={`phase-secondary-button${isSelected("main-menu")}`}
            onClick={onOpenMainMenu}
          >
            {TEXT.pauseMenu.mainMenu}
          </button>
        </div>
      </div>
    </div>
  );
}
