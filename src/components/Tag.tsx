import React from "react";
import { IoIosCloseCircle } from "react-icons/io";

type TagProps = {
  title: string;
  className?: string;
  onDeleteTag?: (tag: string) => void;
};

const Tag = ({ title, className, onDeleteTag }: TagProps) => {
  const handleDeleteTag = () => onDeleteTag(title);

  const onClickTag = (title: string) => () => navigator.clipboard.writeText(title)

  return (
    <div className={"tag " + className}>
      <span onClick={onClickTag(title)}>{title}</span>
      {typeof(onDeleteTag) === "function" && <IoIosCloseCircle className="delete-tag" onClick={handleDeleteTag} />}
    </div>
  );
};

export default Tag;
