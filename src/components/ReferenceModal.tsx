import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { Category, Reference } from "../util/types";
import Tooltip from "./Tooltip";
import DESCRIPTION from "../util/constants";
import ButtonAction from "./ButtonAction";

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
    id: Date.now(),
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
      setTimeout(() => setCreateState(""), 3000);
    }
  }, [createState]);

  useEffect(() => {
    if (reference) setInputProps(reference);
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
        inputProps[node].includes(input.value) ||
        (inputMode === "main" && inputProps.mainTag.length !== 0)
      ) {
        setTagExised(true);
      } else {
        setInputProps({
          ...inputProps,
          [node]:
            node === "mainTag"
              ? input.value
              : inputProps[node].concat([input.value]),
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

  return (
    <div className={modalClass}>
      <div className="backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <h4>
          Add a Reference to {parentCategories[parentCategories.length - 1]}
        </h4>
        <div className="form-input">
          <div className="form-left">
            <div className="image-container">
              <div
                id="dropzone"
                style={{ display: inputProps.refImage ? "none" : "block" }}
              ></div>
              <span>Try dragging an image here or copy an URL</span>
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
              <div className="main-tags-group">
                <div>Main Tag: </div>
                {inputProps.mainTag.length > 0 && (
                  <div className="main-tag">{inputProps.mainTag}</div>
                )}
              </div>
              <div>Secondary Tags: </div>
              <div className="secondary-tags-group">
                <div>
                  {inputProps.secondaryTags.map((tag) => (
                    <div className="secondary-tag">{tag}</div>
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
          buttonText="Cancel"
          onClick={onClose}
        />
        <ButtonAction
          className="button-save"
          buttonText="Save"
          actionState={createState}
          onClick={handleSavingReference}
        />
      </div>
    </div>
  );
};

export default ReferenceModal;
