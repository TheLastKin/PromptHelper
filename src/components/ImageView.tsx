import React, { useEffect, useRef } from "react";

type ImageViewProps = {
  imagePath: string;
  className?: string;
};

const ImageView = ({ imagePath, className = "" }: ImageViewProps) => {
  const imageRef = useRef(null);
  useEffect(() => {
    const preview = document.getElementById("preview");
    const previewImg = preview.querySelector("img");
    (imageRef.current as HTMLElement).addEventListener("mouseenter", (e) => {
      previewImg.src = imagePath;
      preview.style.display = "block";
    });

    (imageRef.current as HTMLElement).addEventListener(
      "mousemove",
      (e: any) => {
        const padding = 16;

        let x = e.clientX + padding;
        let y = e.clientY + padding;

        const rect = preview.getBoundingClientRect();

        if (x + rect.width > window.innerWidth) {
          x = e.clientX - rect.width - padding;
        }

        if (y + rect.height > window.innerHeight) {
          y = e.clientY - rect.height - padding;
        }

        preview.style.left = `${x}px`;
        preview.style.top = `${y}px`;
      }
    );

    (imageRef.current as HTMLElement).addEventListener("mouseleave", () => {
      preview.style.display = "none";
    });
  }, []);
  return (
    <div ref={imageRef} className={"image-view " + className}>
      <img src={imagePath} alt="" />
    </div>
  );
};

export default ImageView;
