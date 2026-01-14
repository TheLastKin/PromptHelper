import React, { useEffect, useState } from "react";
import { Reference } from "../util/types";
import { IoClose } from "react-icons/io5";

type PickedRefsProps = {
  refs: Reference[];
  onViewReferences: () => void;
  onCloseAll: () => void;
};

const PickedRefs = ({
  refs,
  onViewReferences,
  onCloseAll,
}: PickedRefsProps) => {
  const [shouldShow, setShouldShow] = useState(false);
  useEffect(() => {
    setTimeout(() => setShouldShow(true), 800);
  }, []);
  return (
    <div className="picked-refs" style={{ display: shouldShow ? "flex" : "none" }}>
      <img src={"file://" + refs[refs.length - 1].refImage} alt="" onClick={onViewReferences}/>
      <div className="pick-counter">
        <span>{refs.length}</span>
      </div>
      <IoClose className="close-all" onClick={onCloseAll}/>
    </div>
  );
};

export default PickedRefs;
