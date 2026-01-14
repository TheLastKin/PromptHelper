import React, { useEffect, useMemo, useState } from "react";
import { Reference } from "../util/types";

type AddCategoryProps = {
  parentCategories: string[];
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (categoryName: string, parentCategories: string[]) => "fail" | "success";
};

const AddCategoryModal = ({
  parentCategories,
  isOpen,
  onClose,
  onAddCategory,
}: AddCategoryProps) => {
  const [createState, setCreateState] = useState("")

  const modalClass = useMemo(() => {
    let classes = "modal-container";
    classes += isOpen ? " modal-show" : "";
    return classes;
  }, [isOpen]);

  useEffect(() => {
    const inputElement = document.querySelector(
      ".category-input"
    ) as HTMLInputElement;
    if (isOpen && inputElement) {
      inputElement.focus();
    }
  }, [isOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const inputElement = e.target as HTMLInputElement;
      const categoryName = inputElement.value;
      const state = onAddCategory(categoryName, parentCategories)
      setCreateState(state);
      if(state === "success") handleClose();
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  const handleClose = () => {
    const inputElement = document.querySelector(
      ".category-input"
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = "";
    }
    onClose();
  }
  return (
    <div className={modalClass}>
      <div className="backdrop" onClick={handleClose}></div>
      <div className="modal-content sm-content">
        <h4>Add new Category to {parentCategories[parentCategories.length - 1]}</h4>
        <div className="category-input-container">
          <input
            type="text"
            name="categoryName"
            id=""
            className="category-input"
            placeholder="Enter category name"
            onKeyDown={onKeyDown}
          />
          {createState === "fail" && <div className="category-error">Category already existed on the same node!</div>}
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;
