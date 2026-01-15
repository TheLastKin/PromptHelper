import React, { useState } from "react";
import { Reference } from "../util/types";
import Tag from "./Tag";
import ButtonAction from "./ButtonAction";
import { FaCopy } from "react-icons/fa";
import { RiFileCopy2Fill } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";

type RefCardProps = {
  ref: Reference;
  onRemoveRef: (refId: number) => void 
};

let timeout1: any;
let timeout2: any;

const RefCard = ({ ref, onRemoveRef }: RefCardProps) => {
  const [buttonState1, setButtonState1] = useState("")
  const [buttonState2, setButtonState2] = useState("")

  const copySecondaryTags = () => {
    navigator.clipboard.writeText(ref.secondaryTags?.join(", "));
    if (!timeout2) {
      setButtonState2("Copied");
      timeout2 = setTimeout(() => {
        setButtonState2("")
        timeout2 = null;
      }, 1500);
    }
  };
  const copyAllTags = () => {
    navigator.clipboard.writeText(
      ref.mainTag +
        ", " +
        (Array.isArray(ref.secondaryTags) ? ref.secondaryTags?.join(", ") : "")
    );
    if (!timeout1) {
      setButtonState1("Copied");
      timeout1 = setTimeout(() => {
        setButtonState1("")
        timeout1 = null;
      }, 1500);
    }
  };

  const handleRemoveRef = () => onRemoveRef(ref.id)
  return (
    <div className="selected-ref" key={ref.id}>
      <div className="selected-ref-image">
        <img src={"file://" + ref.refImage} alt="" />
      </div>
      <div className="selected-ref-tags">
        <div className="selected-ref-main-tag">
          <Tag title={ref.mainTag} className="main-tag" />
        </div>
        <div className="selected-ref-secondary-tags">
          {ref.secondaryTags?.map((tag) => (
            <Tag key={tag} title={tag} className="secondary-tag" />
          ))}
        </div>
      </div>
      {Array.isArray(ref.secondaryTags) && (
        <ButtonAction
          className="copy-secondary-tags"
          actionState={buttonState2}
          label={<FaCopy />}
          shouldChangeText={false}
          onClick={copySecondaryTags}
        />
      )}
      <ButtonAction
        className="copy-all-tags"
        actionState={buttonState1}
        label={<RiFileCopy2Fill />}
        shouldChangeText={false}
        onClick={copyAllTags}
      />
      <ButtonAction
        className="remove-selected-ref"
        actionState="removed"
        label={<IoMdClose />}
        shouldChangeText={false}
        onClick={handleRemoveRef}
      />
    </div>
  );
};

export default RefCard;
