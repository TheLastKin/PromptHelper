import React, { useMemo, useState } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import MODES from "../util/constants";
import Tooltip from "./Tooltip";

type ButtonModeProps = {
  label: string;
  modeActive: boolean;
  description: string;
  tooltipStyle?: React.CSSProperties,
  onModeToggle: () => void;
};

function ButtonMode({ label, modeActive, onModeToggle, description, tooltipStyle }: ButtonModeProps) {

  const containerClass = useMemo(() => {
    let classes = "button-mode";
    if(modeActive) classes += description === MODES.COLLECT ? " button-mode-collect" : " button-mode-create";
    return classes;
  }, [modeActive])

  return (
    <div className={containerClass} onClick={onModeToggle}>
      <span>{label}</span>
      <Tooltip description={description} tooltipStyle={tooltipStyle}/>
    </div>
  );
}

export default ButtonMode;
