import React, { useEffect, useState } from "react";
import { Reference } from "../util/types";
import ButtonAction from "./ButtonAction";
import RefCard from "./RefCard";

type ReferenceViewerModalProps = {
  show: boolean;
  refs: Reference[];
  onClose: () => void;
};

let timeout: any;

const ReferenceViewerModal = ({
  show,
  refs = [],
  onClose,
}: ReferenceViewerModalProps) => {
  const [buttonState, setButtonState] = useState("");

  const copyAllMainTags = () => {
    const allTags = refs.map((r) => r.mainTag);
    navigator.clipboard.writeText(allTags.join(", "));
    setButtonState("Copied")
    if(!timeout){
        timeout = setTimeout(() => {
            setButtonState("");
            timeout = null
        }, 1500)
    }
  };

  return (
    <div className="viewer-modal" style={{ display: show ? "flex" : "none" }}>
      <div className="backdrop" onClick={onClose}></div>
      <div className="viewer-content">
        <h4>You selected {refs.length} refs</h4>
        <div className="copy-buttons">
          <ButtonAction actionState={buttonState} label="Copy all main tags" onClick={copyAllMainTags} />
        </div>
        <div className="selected-refs-list">
          {refs.map((r) => (
            <RefCard ref={r} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferenceViewerModal;
