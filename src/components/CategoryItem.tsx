import React, { useMemo, useState } from "react";
import { AnimateItem, Category, Reference } from "../util/types";
import ImageView from "./ImageView";

type CategoryItemProps = {
  item: Category;
  parentCategories: string[];
  onAddSubcategory: (parentCategories: string[]) => void;
  onAddReference: (parentCategories: string[]) => void;
  onDeleteCategory: (parentCategories: string[]) => void;
  onDeleteReference: (refId: number, refImagePath: string, hierarchy: string[]) => void;
  onPickReference: (animateProps: AnimateItem, ref: Reference) => void;
  onViewReference: (ref: Reference, parentCategories: string[]) => void;
};

const CategoryItem = ({
  item,
  parentCategories,
  onAddSubcategory,
  onAddReference,
  onDeleteCategory,
  onDeleteReference,
  onPickReference,
  onViewReference
}: CategoryItemProps) => {
  const [showActions, setShowActions] = useState(false);
  const [showContent, setShowContent] = useState(true);

  const isRootCategory = parentCategories.length === 1;

  const containerClass = useMemo(() => {
    let classes = isRootCategory ? "root-category" : "category";
    classes += showContent ? " category-show" : "";
    return classes;
  }, [showContent]);

  const onTitleHover = () => setShowActions(true);
  const onTitleLeave = () => setShowActions(false);

  const toggleContent = () => setShowContent(!showContent);

  const handleDeleteReference = (refId: number, refImagePath: string, hierarchy: string[]) => () => onDeleteReference(refId, refImagePath, hierarchy)
  const handleDeleteCategory = () => onDeleteCategory(parentCategories)
  const handleViewReference = (ref: Reference) => () => onViewReference(ref, parentCategories)
  const handlePickReference = (imagePath: string, ref: Reference) => (e: React.MouseEvent) => {
    const imageNode = (e.target as HTMLElement).parentNode.childNodes[0] as HTMLElement;
    const { x, y } = imageNode.getBoundingClientRect();
    onPickReference({ axis: { x: x, y:y }, imagePath: imagePath, id: Date.now() }, ref)
  }

  return (
    <div className={containerClass}>
      <div
        className="title-container"
        onMouseEnter={onTitleHover}
        onMouseLeave={onTitleLeave}
      >
        <span className="title" onClick={toggleContent}>
          {item.name}
        </span>
        <span className="total-refs">({item.subCategories?.length > 0 ? `${item.subCategories.length} nodes, ` : ""}{item.references.length} refs)</span>
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
                onClick={handleDeleteCategory}
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
        item.subCategories.map((category: Category) => (
          <CategoryItem
            key={category.name}
            item={category}
            parentCategories={parentCategories.concat([category.name])}
            onAddSubcategory={onAddSubcategory}
            onAddReference={onAddReference}
            onDeleteReference={onDeleteReference}
            onDeleteCategory={onDeleteCategory}
            onPickReference={onPickReference}
            onViewReference={onViewReference}
          />
        ))}
      {item.references.map((ref: Reference) => {
        return (
          <div key={ref.id} id={"node-" + ref.id} className="refs">
            <ImageView
              imagePath={`file://${ref.refImage}`}
              className="ref-node-image"
            />
            <span className="ref-node" onClick={handleViewReference(ref)}>{ref.mainTag}</span>
            <span className="pick-node" onClick={handlePickReference(ref.refImage, ref)}>Pick</span>
            <span className="delete-node" onClick={handleDeleteReference(ref.id, ref.refImage, parentCategories)}>Delete</span>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryItem;
