import React, { useEffect, useRef, useState } from "react";
import { AnimateItem, Category, Reference } from "../util/types";
import "./general.css";
import CategoryItem from "../components/CategoryItem";
import ButtonMode from "../components/ButtonMode";
import DESCRIPTION from "../util/constants";
import ReferenceModal from "../components/ReferenceModal";
import AddCategoryModal from "../components/AddCategoryModal";
import MoveToBottom from "../components/MoveToBottom";
import PickedRefs from "../components/PickedRefs";
import ReferenceViewerModal from "../components/ReferenceViewerModal";
import { BsFillPinAngleFill } from "react-icons/bs";
import DeleteSafeGuard from "../components/DeleteSafeGuard";

const defaultSet: Category = {
  name: "Root Category",
  references: [],
  subCategories: [
    {
      name: "Pose",
      references: [],
    },
    {
      name: "Clothing",
      references: [],
      subCategories: [
        {
          name: "Shirt",
          references: [],
        },
        {
          name: "Pants",
          references: [],
        },
        {
          name: "Shoes",
          references: [],
        },
      ],
    },
    {
      name: "Background",
      references: [],
    },
  ],
};

let timerId: NodeJS.Timeout;

const App = () => {
  const [categories, setCategories] = useState<Category>(defaultSet);
  const [modes, setModes] = useState<any>({
    collect: false,
    create: false,
  });
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<{
    parentCategories: string[];
    show: boolean;
  }>({ parentCategories: [], show: false });
  const [showReferenceModal, setShowReferenceModal] = useState<{
    reference?: Reference;
    parentCategories: string[];
    show: boolean;
  }>({ parentCategories: [defaultSet.name], show: false });
  const [viewrModal, setViewerModal] = useState<{
    show: boolean;
    selectedRefs: Reference[];
  }>({
    show: false,
    selectedRefs: [],
  });
  const [animateItems, setAnimateItems] = useState<AnimateItem[]>([]);
  const [isWindowAlwaysOnTop, setAlwaysOnTop] = useState(false);
  const [deleteSafeGuard, setDeleteSafeGuard] = useState<{
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    show: false,
    onConfirm: () => {
      /* what */
    },
    onCancel: () => {
      /* what */
    },
  });

  const modalRef = useRef(showReferenceModal);
  modalRef.current = showReferenceModal;

  useEffect(() => {
    const savedCategories = localStorage.getItem("categories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      localStorage.setItem("categories", JSON.stringify(defaultSet));
    }
    window.api.onURLReceived((e: Electron.IpcRendererEvent, url: string) => {
      setShowReferenceModal({
        parentCategories: modalRef.current.parentCategories,
        show: true,
      });
    });
  }, []);

  const clearAnimateItem = () => {
    try {
      clearTimeout(timerId);
    } catch (error) {
      //what
    }
    timerId = setTimeout(() => setAnimateItems([]), 1500);
  };

  const startCheckingClipboard = () => {
    if (modes.collect) {
      window.api.stopChecking();
    } else {
      window.api.startChecking();
    }
    toggleMode("collect")();
  };

  const toggleMode = (mode: string) => () =>
    setModes({ ...modes, [mode]: !modes[mode] });

  const showReferenceModalHandler = (parentCategories: string[]) =>
    setShowReferenceModal({
      reference: {
        id: -1,
        mainTag: "",
        refImage: "",
      },
      parentCategories: parentCategories,
      show: true,
    });
  const hideAddReferenceModalHandler = () =>
    setShowReferenceModal({ ...showReferenceModal, show: false });
  const showAddCategoryModalHandler = (parentCategories: string[]) =>
    setShowAddCategoryModal({ parentCategories: parentCategories, show: true });
  const hideAddCategoryModalHandler = () =>
    setShowAddCategoryModal({ ...showAddCategoryModal, show: false });

  const addCategory = (categoryName: string, parentCategories: string[]) => {
    const newCategory: Category = {
      name: categoryName,
      references: [],
      subCategories: [],
    };
    const newCategories = categories;
    let targetCategory = newCategories;
    for (const c of parentCategories) {
      if (c === defaultSet.name) continue;
      targetCategory = targetCategory.subCategories.find(
        (category) => category.name === c,
      );
    }
    if (Array.isArray(targetCategory.subCategories)) {
      if (targetCategory.subCategories.find((c) => c.name === categoryName)) {
        return "fail";
      } else {
        targetCategory.subCategories = targetCategory.subCategories.concat([
          newCategory,
        ]);
      }
    } else {
      targetCategory.subCategories = [newCategory];
    }
    saveCategories(newCategories);
    return "success";
  };

  const saveCategories = (categories: Category) => {
    setCategories({ ...categories });
    localStorage.setItem("categories", JSON.stringify(categories));
  };

  const saveRefImage = async (
    path: string,
    name: string,
    arrayBuffer: ArrayBuffer,
    refID: number,
  ) => {
    if (/^(https:|blob:)/.test(path)) {
      let filePath = "";
      if (path.includes("https")) {
        filePath = await window.api.saveFromHTTPS(path, refID);
      } else {
        filePath = await window.api.saveFromBuffer(arrayBuffer, name, refID);
      }
      return filePath;
    }
    return path.slice(7);
  };

  const saveReference = async (
    ref: Reference & {
      hierarchy: string[];
      refImageName: string;
      refImageArrayBuffer: ArrayBuffer;
    },
  ) => {
    try {
      const newRefID = ref.id < 0 ? Date.now() : ref.id;
      const newRef = {
        id: newRefID,
        mainTag: ref.mainTag,
        refImage: await saveRefImage(
          ref.refImage,
          ref.refImageName,
          ref.refImageArrayBuffer,
          newRefID,
        ),
        secondaryTags: ref.secondaryTags,
        description: ref.description,
      };
      const newCategories = categories;
      let targetCategory = newCategories;
      for (const c of ref.hierarchy) {
        if (c === defaultSet.name) continue;
        targetCategory = targetCategory.subCategories.find(
          (c2) => c2.name === c,
        );
      }
      if (targetCategory.references.find((r) => r.id === newRef.id)) {
        targetCategory.references = targetCategory.references.map((r) =>
          r.id === newRef.id ? newRef : r,
        );
      } else {
        targetCategory.references.push(newRef);
      }
      saveCategories(newCategories);
      return "Saved";
    } catch (error) {
      return "Failed";
    }
  };

  const deleteReference = (
    refId: number,
    refImagePath: string,
    hierarchy: string[],
  ) => {
    window.api.removeFile(refImagePath);
    const newCategories = categories;
    let targetCategory = newCategories;
    for (const c of hierarchy) {
      if (c === defaultSet.name) continue;
      targetCategory = targetCategory.subCategories.find((c2) => c2.name === c);
    }
    targetCategory.references = targetCategory.references.filter(
      (r) => r.id !== refId,
    );
    saveCategories(newCategories);
  };

  const deleteCategory = (parentCategories: string[]) => {
    const newCategories = categories;
    let parentCategory = newCategories;
    let targetCategory = newCategories;
    for (const c of parentCategories) {
      if (c === defaultSet.name) continue;
      parentCategory = targetCategory;
      targetCategory = targetCategory.subCategories.find((c2) => c2.name === c);
    }
    const recursiveDelete = (category: Category) => {
      if (Array.isArray(category.subCategories)) {
        for (const c of category.subCategories) {
          recursiveDelete(c);
        }
      }
      for (const r of category.references) {
        window.api.removeFile(r.refImage);
      }
    };
    const handleDelete = () => {
      recursiveDelete(targetCategory);
      parentCategory.subCategories = parentCategory.subCategories.filter(
        (c) => c.name !== targetCategory.name,
      );
      saveCategories(newCategories);
    };
    if(targetCategory.references.length >= 3 || (targetCategory.subCategories && targetCategory.subCategories.length >= 3)) {
      setDeleteSafeGuard({
        show: true,
        onConfirm: () => {
          handleDelete();
          setDeleteSafeGuard({
            show: false,
            onConfirm: null,
            onCancel: null,
          });
        },
        onCancel: () =>
          setDeleteSafeGuard({
            show: false,
            onConfirm: null,
            onCancel: null,
          }),
      });
    } else {
      handleDelete();
    }
  };

  const onViewReference = (ref: Reference, parentCategories: string[]) => {
    setShowReferenceModal({
      show: true,
      reference: ref,
      parentCategories: parentCategories,
    });
  };

  const onPickReference = (animeteProps: AnimateItem, ref: Reference) => {
    setAnimateItems((prev) => [...prev, animeteProps]);
    clearAnimateItem();
    if (!viewrModal.selectedRefs.find((r) => r.id === ref.id)) {
      setViewerModal({
        show: false,
        selectedRefs: viewrModal.selectedRefs.concat([ref]),
      });
    } else {
      setViewerModal({
        show: false,
        selectedRefs: viewrModal.selectedRefs.map((r) =>
          r.id === ref.id ? ref : r,
        ),
      });
    }
  };

  const deselectAllRefs = () =>
    setViewerModal({ show: false, selectedRefs: [] });

  const viewReferences = () => setViewerModal({ ...viewrModal, show: true });

  const closeViewrModal = () => setViewerModal({ ...viewrModal, show: false });

  const removeSelectedRef = (refId: number) =>
    setViewerModal({
      ...viewrModal,
      selectedRefs: viewrModal.selectedRefs.filter((ref) => ref.id !== refId),
    });

  const randomPicks = () => {
    const pickedRefs: Reference[] = [];
    const loop = (categories: Category) => {
      if (Array.isArray(categories.subCategories)) {
        for (const c of categories.subCategories) {
          const shouldPick =
            pickedRefs.length >= 5 ? Math.random() > 0.4 : true;
          if (shouldPick && c.references.length > 0) {
            pickedRefs.push(
              c.references[Math.floor(Math.random() * c.references.length)],
            );
          }
          loop(c);
        }
      }
    };
    loop(categories);
    getAnimateProps(pickedRefs);
    setViewerModal({ show: false, selectedRefs: pickedRefs });
  };

  const getAnimateProps = (refs: Reference[]) => {
    const props: AnimateItem[] = [];
    for (let i = 0; i < refs.length; i++) {
      const targetNode = document.querySelector(`#node-${refs[i].id}`)
        .childNodes[0] as HTMLElement;
      const { x, y } = targetNode.getBoundingClientRect();
      props.push({
        axis: { x: x, y: y },
        id: refs[i].id,
        imagePath: refs[i].refImage,
        transitionDelay: 100 * Math.min(i, 1) + 50 * i,
      });
    }
    setAnimateItems(props);
    clearAnimateItem();
  };

  const toggleWindowMode = () => {
    window.api.toggleWindowMode();
    setAlwaysOnTop(!isWindowAlwaysOnTop);
  };

  return (
    <div className="container">
      <div className="drag-region"></div>
      <div className="header">
        <CategoryItem
          key={categories.name}
          item={categories}
          parentCategories={[defaultSet.name]}
          onAddSubcategory={showAddCategoryModalHandler}
          onAddReference={showReferenceModalHandler}
          onDeleteReference={deleteReference}
          onDeleteCategory={deleteCategory}
          onPickReference={onPickReference}
          onViewReference={onViewReference}
        />
      </div>
      <div className="button-mode-container">
        <ButtonMode
          label="Collect"
          modeActive={modes.collect}
          description={DESCRIPTION.COLLECT}
          onModeToggle={startCheckingClipboard}
        />
        <ButtonMode
          label="Create"
          modeActive={true}
          description={DESCRIPTION.CREATE}
          onModeToggle={randomPicks}
          tooltipStyle={{ transform: "translateX(-80%)" }}
        />
      </div>
      <ReferenceModal
        isOpen={showReferenceModal.show}
        reference={showReferenceModal.reference}
        parentCategories={showReferenceModal.parentCategories}
        onClose={hideAddReferenceModalHandler}
        onSavingReference={saveReference}
      />
      <AddCategoryModal
        isOpen={showAddCategoryModal.show}
        parentCategories={showAddCategoryModal.parentCategories}
        onClose={hideAddCategoryModalHandler}
        onAddCategory={addCategory}
      />
      {animateItems.map((item) => (
        <MoveToBottom key={item.id} animateProps={item} />
      ))}
      {viewrModal.selectedRefs.length > 0 && (
        <PickedRefs
          refs={viewrModal.selectedRefs}
          onCloseAll={deselectAllRefs}
          onViewReferences={viewReferences}
        />
      )}
      <ReferenceViewerModal
        show={viewrModal.show}
        refs={viewrModal.selectedRefs}
        onClose={closeViewrModal}
        onRemoveRef={removeSelectedRef}
      />
      <DeleteSafeGuard
        show={deleteSafeGuard.show}
        onConfirm={deleteSafeGuard.onConfirm}
        onCancel={deleteSafeGuard.onCancel}
      />
      <div id="preview">
        <img src="" alt="" />
      </div>
      <BsFillPinAngleFill
        className={"pin-window " + (isWindowAlwaysOnTop ? "is-on-top" : "")}
        onClick={toggleWindowMode}
      />
    </div>
  );
};

export default App;
