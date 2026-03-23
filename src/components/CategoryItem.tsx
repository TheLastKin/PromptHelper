import React, { useEffect, useMemo, useState } from "react";
import { AnimateItem, Category, Reference } from "../util/types";
import ImageView from "./ImageView";
import { BsArrowsCollapse } from "react-icons/bs";
import ButtonAction from "./ButtonAction";
import ReferenceItem from "./ReferenceItem";

type CategoryItemProps = {
  item: Category;
  parentCategories: string[];
  collapseAllNodes?: boolean;
  query?: string;
  gridType?: number;
  onAddSubcategory: (parentCategories: string[]) => void;
  onAddReference: (parentCategories: string[]) => void;
  onDeleteCategory: (parentCategories: string[]) => void;
  onDeleteReference: (
    refId: number,
    refImagePath: string,
    hierarchy: string[],
  ) => void;
  onPickReference: (animateProps: AnimateItem, ref: Reference) => void;
  onViewReference: (ref: Reference, parentCategories: string[]) => void;
  excludeCategory: (categoryName: string) => void;
};

const CategoryItem = ({
  item,
  parentCategories,
  collapseAllNodes = false,
  query,
  gridType = 0,
  onAddSubcategory,
  onAddReference,
  onDeleteCategory,
  onDeleteReference,
  onPickReference,
  onViewReference,
  excludeCategory,
}: CategoryItemProps) => {
  const [showActions, setShowActions] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [collapseAll, setCollapseAll] = useState(collapseAllNodes);
  const [queryMode, setQueryMode] = useState(0);

  useEffect(() => {
    setShowContent(!collapseAllNodes);
  }, [collapseAllNodes]);

  const isRootCategory = parentCategories.length === 1;

  const containerClass = useMemo(
    () => (isRootCategory ? "root-category" : "category"),
    [showContent],
  );

  const onTitleHover = () => setShowActions(true);
  const onTitleLeave = () => setShowActions(false);

  const toggleContent = () => setShowContent(!showContent);

  const handleDeleteReference =
    (refId: number, refImagePath: string, hierarchy: string[]) => () =>
      onDeleteReference(refId, refImagePath, hierarchy);
  const handleDeleteCategory = () => onDeleteCategory(parentCategories);
  const handleViewReference = (ref: Reference) => () =>
    onViewReference(ref, parentCategories);
  const handlePickReference =
    (imagePath: string, ref: Reference) => (e: React.MouseEvent) => {
      const imageNode = (e.target as HTMLElement).parentNode
        .childNodes[0] as HTMLElement;
      const { x, y } = imageNode.getBoundingClientRect();
      onPickReference(
        { axis: { x: x, y: y }, imagePath: imagePath, id: Date.now() },
        ref,
      );
    };

  const handleCollapseAll = () => setCollapseAll(!collapseAll);

  const handleExcludeCategory = (e: React.MouseEvent) => {
    setQueryMode((queryMode + 1) % 3);
    excludeCategory(item.name);
    e.preventDefault();
  };

  return (
    <div className={containerClass}>
      <div
        className="title-container"
        onMouseEnter={onTitleHover}
        onMouseLeave={onTitleLeave}
      >
        <span
          className="title"
          onClick={toggleContent}
          onContextMenu={handleExcludeCategory}
          style={{
            color:
              queryMode === 0 ? "inherit" : queryMode === 1 ? "yellow" : "red",
          }}
        >
          {item.name}
        </span>
        <span className="total-refs">
          (
          {item.subCategories?.length > 0
            ? `${item.subCategories.length} nodes, `
            : ""}
          {item.references.length} refs)
        </span>
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
              <button className="action-button" onClick={handleDeleteCategory}>
                Delete
              </button>
            )}
            {item.subCategories?.length > 0 && (
              <ButtonAction
                className="collapse-all"
                label={<BsArrowsCollapse />}
                onClick={handleCollapseAll}
              />
            )}
          </div>
        ) : (
          isRootCategory && <span className="hover-text">Hover here</span>
        )}
      </div>
      <div
        className={"category-content"}
        style={{ display: showContent ? "block" : "none" }}
      >
        {Array.isArray(item.subCategories) &&
          item.subCategories.map((category: Category) => (
            <CategoryItem
              key={category.name}
              item={category}
              collapseAllNodes={collapseAll}
              parentCategories={parentCategories.concat([category.name])}
              excludeCategory={excludeCategory}
              onAddSubcategory={onAddSubcategory}
              onAddReference={onAddReference}
              onDeleteReference={onDeleteReference}
              onDeleteCategory={onDeleteCategory}
              onPickReference={onPickReference}
              onViewReference={onViewReference}
              query={query}
              gridType={gridType}
            />
          ))}
        <div className={`references ref-grid-type-${gridType}`}>
          {item.references.map((ref: Reference) => {
            return (
              <ReferenceItem
                key={ref.id}
                ref={ref}
                parentCategories={parentCategories}
                handleDeleteReference={handleDeleteReference}
                handlePickReference={handlePickReference}
                handleViewReference={handleViewReference}
                query={query}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryItem;
