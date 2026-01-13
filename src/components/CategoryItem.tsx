import React, { useMemo, useState } from "react";
import { Category, Reference } from "../util/types";

type CategoryItemProps = {
  item: Category;
  parentCategories: string[];
  references: Reference[];
  onAddSubcategory: (parentCategories: string[]) => void;
  onAddReference: (parentCategories: string[]) => void;
  onDeleteCategory?: (category: string) => void;
  onDeleteReference: (refId: number, refImagePath: string, hierarchy: string[]) => void;
};

const CategoryItem = ({
  item,
  parentCategories,
  references,
  onAddSubcategory,
  onAddReference,
  onDeleteCategory,
  onDeleteReference
}: CategoryItemProps) => {
  const [showActions, setShowActions] = useState(false);
  const [showContent, setShowContent] = useState(true);

  const isRootCategory = parentCategories.length === 1;

  const containerClass = useMemo(() => {
    let classes = isRootCategory ? "root-category" : "category";
    classes += showContent ? " category-show" : "";
    return classes;
  }, [showContent]);

  const getReference = (refID: number) =>
    references.find((ref) => ref.id === refID);

  const onTitleHover = () => setShowActions(true);
  const onTitleLeave = () => setShowActions(false);

  const toggleContent = () => setShowContent(!showContent);

  const handleDeleteReference = (refId: number, refImagePath: string, hierarchy: string[]) => () => onDeleteReference(refId, refImagePath, hierarchy)

  return (
    <div className={containerClass} key={item.name}>
      <div
        className="title-container"
        onMouseEnter={onTitleHover}
        onMouseLeave={onTitleLeave}
      >
        <span className="title" onClick={toggleContent}>
          {item.name}
        </span>
        <span className="total-refs">({item.references.length} refs)</span>
        {showActions ? (
          <div className="action-buttons">
            <button
              className="action-button"
              onClick={() => onAddSubcategory(parentCategories)}
            >
              Add Subcategory
            </button>
            {!isRootCategory && (
              <button
                className="action-button"
                onClick={() => onAddReference(parentCategories)}
              >
                Add Reference
              </button>
            )}
            {!isRootCategory && (
              <button
                className="action-button"
                onClick={() => onDeleteCategory(item.name)}
              >
                Delete
              </button>
            )}
          </div>
        ) : (
          isRootCategory && <span className="hover-text">Hover here</span>
        )}
      </div>
      {Array.isArray(item.subCategories) &&
        item.subCategories.map((category: Category, i: number) => (
          <CategoryItem
            key={category.name}
            item={category}
            references={references}
            parentCategories={parentCategories.concat([category.name])}
            onAddSubcategory={onAddSubcategory}
            onAddReference={onAddReference}
            onDeleteReference={onDeleteReference}
          />
        ))}
      {item.references.map((refId: number) => {
        const ref = getReference(refId);
        if (!ref) return null;
        return (
          <div className="refs">
            <img
              src={`file://${ref.refImage}`}
              alt=""
              className="ref-node-image"
            />
            <span className="ref-node">{ref.mainTag}</span>
            <span className="pick-node">Pick</span>
            <span className="delete-node" onClick={handleDeleteReference(refId, ref.refImage, parentCategories)}>Delete</span>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryItem;
