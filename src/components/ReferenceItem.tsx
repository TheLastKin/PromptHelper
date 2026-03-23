import React, { useEffect } from "react";
import { Reference } from "../util/types";
import ImageView from "./ImageView";

type ReferenceItemProps = {
  ref: Reference;
  parentCategories: string[];
  query?: string;
  handleViewReference: (ref: Reference) => () => void;
  handlePickReference: (
    refImagePath: string,
    ref: Reference,
  ) => (e: React.MouseEvent) => void;
  handleDeleteReference: (
    refId: number,
    refImagePath: string,
    hierarchy: string[],
  ) => () => void;
};

const ReferenceItem = ({
  ref,
  parentCategories,
  handleViewReference,
  handlePickReference,
  handleDeleteReference,
  query,
}: ReferenceItemProps) => {
    const labelElement = React.useRef<HTMLSpanElement>(null);
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  useEffect(() => {
    highlightText(query);
  }, [query])

  const highlightText = (query: string) => {
    const safeQuery = escapeRegExp(query);
    const regex = new RegExp(`(${safeQuery})`, "gi");

    labelElement.current!.innerHTML = labelElement.current!.textContent!.replace(
      regex,
      `<mark>${query}</mark>`,
    );
  }

  return (
    <div key={ref.id} id={"node-" + ref.id} className="refs">
      <ImageView
        imagePath={`file://${ref.refImage}`}
        className="ref-node-image"
      />
      <span ref={labelElement} className="ref-node" onClick={handleViewReference(ref)}>
        {ref.mainTag}
      </span>
      <span
        className="pick-node"
        onClick={handlePickReference(ref.refImage, ref)}
      >
        Pick
      </span>
      <span
        className="delete-node"
        onClick={handleDeleteReference(ref.id, ref.refImage, parentCategories)}
      >
        Delete
      </span>
    </div>
  );
};

export default ReferenceItem;
