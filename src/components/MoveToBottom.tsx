import React, { useEffect, useState } from "react";
import { AnimateItem } from "../util/types";

type MoveToBottomTypes = {
  animateProps: AnimateItem;
};

const MoveToBottom = ({
  animateProps,
}: MoveToBottomTypes) => {
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    setStartAnimation(true);
  }, []);
  return (
    <div
      className={
        startAnimation ? "move-to-bottom start-moving" : "move-to-bottom"
      }
      style={{
        transform: `translate(${animateProps.axis.x}px, ${animateProps.axis.y}px)`,
        transitionDelay: animateProps.transitionDelay ? `${animateProps.transitionDelay}` : "0"
      }}
    >
      <img src={"file://" + animateProps.imagePath} alt="" />
    </div>
  );
};

export default MoveToBottom;
