import React, { ReactNode, useEffect, useMemo, useRef } from "react";

type ButtonActionProps = {
  label: string | ReactNode;
  onClick: () => void;
  actionState?: string;
  className?: string;
  shouldChangeText?: boolean;
};

const ButtonAction = ({
  label,
  onClick,
  actionState = "",
  className,
  shouldChangeText = true,
}: ButtonActionProps) => {
  const divRef = useRef(null);
  const text = useMemo(
    () => (actionState.length > 0 && shouldChangeText ? actionState : label),
    [actionState, label]
  );

  useEffect(() => {
    const button = divRef.current as HTMLElement;
    const timerNode = button.childNodes[1];
    if (actionState.length > 0) {
      (timerNode as HTMLElement).className = "timer timer-play";
    } else {
      (timerNode as HTMLElement).className = "timer";
    }
  }, [actionState]);

  return (
    <div
      ref={divRef}
      className={`button-action ${className} ${actionState.toLowerCase()}`}
      onClick={onClick}
    >
      <div className="button-text">{text}</div>
      <div className="timer"></div>
    </div>
  );
};

export default ButtonAction;
