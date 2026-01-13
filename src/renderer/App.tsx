import React, { useEffect, useRef, useState } from "react";
import { Category, Reference } from "../util/types";
import "./general.css";
import CategoryItem from "../components/CategoryItem";
import ButtonMode from "../components/ButtonMode";
import DESCRIPTION from "../util/constants";
import ReferenceModal from "../components/ReferenceModal";
import AddCategoryModal from "../components/AddCategoryModal";

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

const App = () => {
  const [refs, setRefs] = useState<Reference[]>([]);
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

  const modalRef = useRef(showReferenceModal);
  modalRef.current = showReferenceModal;

  useEffect(() => {
    const savedRefs = localStorage.getItem("refs");
    const savedCategories = localStorage.getItem("categories");
    if (savedCategories) {
      if (savedRefs) setRefs(JSON.parse(savedRefs));
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

  const renderItems = (item: Category) => (
    <CategoryItem
      key={item.name}
      item={item}
      references={refs}
      parentCategories={[defaultSet.name]}
      onAddSubcategory={showAddCategoryModalHandler}
      onAddReference={showReferenceModalHandler}
      onDeleteReference={deleteReference}
    />
  );

  const showReferenceModalHandler = (parentCategories: string[]) =>
    setShowReferenceModal({
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
        (category) => category.name === c
      );
    }
    targetCategory.subCategories = targetCategory.subCategories
      ? targetCategory.subCategories.concat([newCategory])
      : [newCategory];
    saveCategories(newCategories);
  };

  const saveCategories = (categories: Category) => {
    localStorage.setItem("categories", JSON.stringify(categories));
    setCategories(categories);
  };

  const saveReference = async (
    ref: Reference & {
      hierarchy: string[];
      refImageName: string;
      refImageArrayBuffer: ArrayBuffer;
    }
  ) => {
    try {
      let filePath = "";
      if (ref.refImage.includes("https")) {
        filePath = await window.api.saveFromHTTPS(ref.refImage);
      } else {
        filePath = await window.api.saveFromBuffer(
          ref.refImageArrayBuffer,
          ref.refImageName
        );
      }
      const newRefId = Date.now();
      const newRefs: Reference[] = refs.concat([
        {
          id: newRefId,
          mainTag: ref.mainTag,
          refImage: filePath,
          secondaryTags: ref.secondaryTags,
          description: ref.description,
        },
      ]);
      updateReferences(newRefs);
      const newCategories = categories;
      let targetCategory = newCategories;
      for (const c of ref.hierarchy) {
        if (c === defaultSet.name) continue;
        targetCategory = targetCategory.subCategories.find(
          (c2) => c2.name === c
        );
      }
      targetCategory.references.push(newRefId);
      updateCategories(newCategories)
      return "Saved";
    } catch (error) {
      return "Failed";
    }
  };

  const deleteReference = (refId: number, refImagePath: string, hierarchy: string[]) => {
    const newRefs = refs.filter((ref) => ref.id !== refId);
    updateReferences(newRefs);
    window.api.removeFile(refImagePath)
    const newCategories = categories;
    let targetCategory = newCategories;
    for(const c of hierarchy){
      if(c === defaultSet.name) continue;
      targetCategory = targetCategory.subCategories.find(c2 => c2.name === c);
    }
    targetCategory.references = targetCategory.references.filter(r => r !== refId);
    updateCategories(newCategories)
  };

  const updateReferences = (newRefs: Reference[]) => {
    setRefs(newRefs);
    localStorage.setItem("refs", JSON.stringify(newRefs));
  };

  const updateCategories = (newCategories: Category) => {
    setCategories(newCategories);
    localStorage.setItem("categories", JSON.stringify(newCategories));
  };

  return (
    <div className="container">
      <div className="drag-region"></div>
      <div className="header">{renderItems(categories)}</div>
      <div className="button-mode-container">
        <ButtonMode
          label="Mode Collect"
          modeActive={modes.collect}
          description={DESCRIPTION.COLLECT}
          onModeToggle={startCheckingClipboard}
        />
        <ButtonMode
          label="Mode Create"
          modeActive={modes.create}
          description={DESCRIPTION.CREATE}
          onModeToggle={toggleMode("create")}
          tooltipStyle={{ transform: "translateX(-80%)" }}
        />
      </div>
      <ReferenceModal
        isOpen={showReferenceModal.show}
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
    </div>
  );
};

export default App;
