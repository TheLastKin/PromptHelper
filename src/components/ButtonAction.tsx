import React, { useEffect, useMemo } from "react";

type ButtonActionProps = {
  buttonText: string;
  onClick: () => void;
  actionState?: string;
  className: string;
};

const ButtonAction = ({
  buttonText,
  onClick,
  actionState = "",
  className,
}: ButtonActionProps) => {

  const text = useMemo(() => actionState.length > 0 ? actionState : buttonText, [actionState])

  useEffect(() => {
    const button = document.querySelector(
      `.button-action.${className}`
    ) as HTMLElement;
    const timerNode = button.childNodes[1];
    if (actionState.length > 0) {
      (timerNode as HTMLElement).className = "timer timer-play";
    } else {
      (timerNode as HTMLElement).className = "timer";
    }
  }, [actionState]);

  return (
    <div className={`button-action ${className} ${actionState.toLowerCase()}`}>
      <div className="button-text" onClick={onClick}>
        {text}
      </div>
      <div className="timer"></div>
    </div>
  );
};

export default ButtonAction;
