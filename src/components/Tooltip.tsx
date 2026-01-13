import React, { useMemo, useState } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";

type TooltipProps = {
  description: string;
  tooltipStyle?: React.CSSProperties
};

const Tooltip = ({ description, tooltipStyle }: TooltipProps) => {
  const [showDescription, setShowDescription] = useState(false);
  const descriptionClass = useMemo(() => {
    let classes = "description";
    classes += showDescription ? " description-show" : "";
    return classes;
  }, [showDescription]);

  const onIconHover = () => setShowDescription(true);
  const onIconLeave = () => setShowDescription(false);
  return (
    <div className="tooltip">
      {" "}
      <FaRegQuestionCircle
        className="description-icon"
        onMouseEnter={onIconHover}
        onMouseLeave={onIconLeave}
      />
      <div className={descriptionClass} style={tooltipStyle}>{description}</div>
    </div>
  );
};

export default Tooltip;
