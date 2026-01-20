import React, { useEffect, useMemo, useState } from "react";
import ButtonAction from "./ButtonAction";
import Tooltip from "./Tooltip";
import DESCRIPTION from "../util/constants";

type DownloadModalProps = {
  downloadURLs: string[];
  show: boolean;
  onClose: () => void;
};

const DownloadModal = ({ downloadURLs, show, onClose }: DownloadModalProps) => {
  const [downloadState, setDownloadState] = useState(-1); // -1: idle, 0: downloading, 1: completed
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState<string[]>([]);
  const [previousDownloads, setPreviousDownloads] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const newDownloads = useMemo(() => {
    return downloadURLs.filter((url) => !previousDownloads.includes(url));
  }, [downloadURLs, previousDownloads]);
  const containerClass = useMemo(() => {
    let classes = "modal-container";
    classes += show ? " modal-show" : "";
    return classes;
  }, [show]);

  useEffect(() => {
    const downloads = JSON.parse(
      localStorage.getItem("downloads") || "[]",
    ) as string[];
    if (downloads) {
      setPreviousDownloads(downloads);
    }
    window.api.downloadProgress((e, prog: number) => {
      setProgress(prog);
    });
  }, []);

  const startDownload = (mode: "all" | "new") => async () => {
    const downloadFolder = await window.api.selectDownloadFolder();
    if (downloadFolder === "") {
      return;
    }
    const urlsToDownload = mode === "all" ? downloadURLs : newDownloads;
    setTotalDownloads(urlsToDownload);
    setDownloadState(0);
    let count = 0;
    for (const url of urlsToDownload) {
      const result = await window.api.startDownload(url);
      if (result === "success") {
        count += 1;
        setDownloadedCount(count);
      }
    }
    const updatedDownloads = Array.from(
      new Set([...previousDownloads, ...urlsToDownload]),
    );
    localStorage.setItem("downloads", JSON.stringify(updatedDownloads));
    setPreviousDownloads(updatedDownloads);
    setDownloadState(1);
  };

  return (
    <div className={containerClass}>
      <div className="backdrop" onClick={onClose}></div>
      <div className="modal-content sm-content">
        <h4>
          {downloadState === -1
            ? `Detect (${downloadURLs.length}) urls`
            : downloadState === 0
              ? `Downloading...${Math.round(progress * 100)}% ${downloadedCount}/${totalDownloads.length}`
              : "Download Complete"}
            <Tooltip description={DESCRIPTION.DOWNLOAD} tooltipStyle={{ width: "200px" }}/>
        </h4>
        <div className="action-buttons download-buttons" style={{ display: downloadURLs.length === 0 ? "none" : "flex" }}>
          {downloadState === -1 && (
            <>
              <ButtonAction
                className="download-all"
                label={`Download all (${downloadURLs.length})`}
                onClick={startDownload("all")}
              />
              <ButtonAction
                className="download-new"
                label={`Download new (${newDownloads.length})`}
                onClick={startDownload("new")}
              />
            </>
          )}
          {downloadState === 1 && (
            <ButtonAction
              className="download-finish"
              label="Done"
              onClick={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
