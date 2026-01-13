import React, { useEffect, useMemo } from "react";
import { Reference } from "../util/types";

type AddCategoryProps = {
  parentCategories: string[];
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (categoryName: string, parentCategories: string[]) => void;
};

const AddCategoryModal = ({
  parentCategories,
  isOpen,
  onClose,
  onAddCategory,
}: AddCategoryProps) => {
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
      onAddCategory(categoryName, parentCategories);
      handleClose();
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
        <div className="form-input">
          <input
            type="text"
            name="categoryName"
            id=""
            className="category-input"
            placeholder="Enter category name"
            onKeyDown={onKeyDown}
          />
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;
