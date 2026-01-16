import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { Category, Reference } from "../util/types";
import Tooltip from "./Tooltip";
import DESCRIPTION from "../util/constants";
import ButtonAction from "./ButtonAction";
import { IoIosCloseCircle } from "react-icons/io";
import Tag from "./Tag";

type ReferenceProps = {
  reference?: Reference;
  parentCategories: string[];
  isOpen: boolean;
  onClose: () => void;
  onSavingReference: (
    inputProps: Reference & { hierarchy: string[]; refImageName?: string }
  ) => Promise<"Saved" | "Failed">;
};

const ReferenceModal = ({
  reference,
  parentCategories,
  isOpen,
  onClose,
  onSavingReference,
}: ReferenceProps) => {
  const [inputMode, setInputMode] = useState<string>("main");
  const [inputProps, setInputProps] = useState<
    Reference & { refImageName?: string; refImageArrayBuffer?: ArrayBuffer }
  >({
    id: -1,
    mainTag: "",
    secondaryTags: [],
    description: "",
    refImage: "",
  });
  const [isTagExisted, setTagExised] = useState(false);
  const [createState, setCreateState] = useState("");
  const inputPropsRef = useRef(inputProps);
  inputPropsRef.current = inputProps;

  useEffect(() => {
    if (createState !== "") {
      if(createState === "success") setInputProps({ id: -1, mainTag: "", refImage: inputProps.refImage })
      setTimeout(() => setCreateState(""), 1500);
    }
  }, [createState]);

  useEffect(() => {
    if (reference) setInputProps({ ...reference, refImage: reference.refImage ? `file://${reference.refImage}` : "" });
  }, [reference]);

  useEffect(() => {
    const dropzone = document.querySelector("#dropzone") as HTMLElement;
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    dropzone.addEventListener("drop", async (e) => {
      e.preventDefault();

      const files = e.dataTransfer.files;

      if (files.length > 0) {
        const file = files[0];

        if (file.type.startsWith("image/")) {
          setInputProps({
            ...inputProps,
            refImage: URL.createObjectURL(file),
            refImageName: file.name,
            refImageArrayBuffer: await file.arrayBuffer(),
          });
        }
      }
    });
    window.api.onURLReceived((e: Electron.IpcRendererEvent, url: string) => {
      setInputProps({
        ...inputPropsRef.current,
        refImage: url,
      });
    });
  }, []);

  const inputClass = useMemo(() => {
    if (inputMode === "secondary") return "label-secondary";
    return "label-main";
  }, [inputMode]);

  const modalClass = useMemo(() => {
    let classes = "modal-container";
    classes += isOpen ? " modal-show" : "";
    return classes;
  }, [isOpen]);

  const onTagInput = (e: React.KeyboardEvent) => {
    const input = e.target as HTMLInputElement;
    if (e.key === "Enter") {
      const node = inputMode === "main" ? "mainTag" : "secondaryTags";
      if (
        inputProps[node]?.includes(input.value) ||
        (inputMode === "main" && inputProps.mainTag.length !== 0)
      ) {
        setTagExised(true);
      } else {
        setInputProps({
          ...inputProps,
          [node]:
            node === "mainTag"
              ? input.value
              : (inputProps[node] || []).concat([input.value]),
        });
        setTagExised(false);
        input.value = "";
      }
    } else if (e.key === "Alt") {
      setInputMode(inputMode === "main" ? "secondary" : "main");
      setTagExised(false);
    }
  };

  const handleSavingReference = async () => {
    if (!inputProps.refImage || !inputProps.mainTag) return;
    setCreateState(
      await onSavingReference({ ...inputProps, hierarchy: parentCategories })
    );
  };

  const onNoteInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputProps({ ...inputProps, description: e.target.value });
  };

  const deletemMainTag = () => setInputProps({...inputProps, mainTag: ""})

  const deleteSecondaryTag = (tag: string) => setInputProps({...inputProps, secondaryTags: inputProps.secondaryTags.filter(t => t !== tag)})

  const title = useMemo(() => inputProps.id > 0 ? `Viewing a Reference of ${parentCategories[parentCategories.length - 1]}`: `Add a Reference to ${parentCategories[parentCategories.length - 1]}`, [inputProps])

  return (
    <div className={modalClass}>
      <div className="backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <h4>
          {title}
        </h4>
        <div className="form-input">
          <div className="form-left">
            <div className="image-container">
              <div
                id="dropzone"
                style={{ opacity: inputProps.refImage.length > 0 ? 0 : 1 }}
              ></div>
              <span>Try dragging an image here</span>
              <img
                className="reference-image"
                src={inputProps?.refImage}
                alt=""
              />
            </div>
          </div>
          <div className="form-right">
            <div className="hierarchy">
              <label>
                Hierarchy: <Tooltip description={DESCRIPTION.HIERARCHY} />
              </label>
              <div className="hierarchy-tree">
                {parentCategories.map((category: string, index) => (
                  <>
                    <span className="hierarchy-node">{category}</span>
                    {index !== parentCategories.length - 1 && (
                      <span className="to">{">"}</span>
                    )}
                  </>
                ))}
                <div className="node-list"></div>
              </div>
            </div>
            <div className="tag-input-container">
              <label className={inputClass}>
                {inputMode === "main"
                  ? "Enter Main Tag"
                  : "Enter Secondary Tag"}
                : <Tooltip description={DESCRIPTION.TAG_INPUT} />
              </label>
              {isTagExisted && <div className="tag-exist">Tag existed!</div>}
              <input
                type="text"
                name="tag"
                id=""
                className="tag-input"
                onKeyDown={onTagInput}
              />
            </div>
            <div className="tags">
              <div className="main-tag-group">
                <span>Main Tag: </span>
                {inputProps.mainTag.length > 0 && (
                  <Tag title={inputProps.mainTag} className="main-tag" onDeleteTag={deletemMainTag}/>
                )}
              </div>
              <div>Secondary Tags: </div>
              <div className="secondary-tags-group">
                <div>
                  {inputProps.secondaryTags?.map((tag) => (
                    <Tag key={tag} title={tag} className="secondary-tag" onDeleteTag={deleteSecondaryTag}/>
                  ))}
                </div>
              </div>
            </div>
            <div className="note-input-container">
              <label>Note: </label>
              <textarea
                name=""
                id=""
                className="note-input"
                onChange={onNoteInput}
              />
            </div>
          </div>
        </div>
        <ButtonAction
          className="button-cancel"
          label="Cancel"
          onClick={onClose}
        />
        <ButtonAction
          className="button-save"
          label="Save"
          actionState={createState}
          onClick={handleSavingReference}
        />
      </div>
    </div>
  );
};

export default ReferenceModal;
