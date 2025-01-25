"use client";

import { useEffect } from "react";
import { useModal } from "src/hooks/useModal";

import styles from "./ModalContents.module.scss";

export type ModalContentsProps = {};

export const ModalContents = ({}: ModalContentsProps) => {
  const { contents, color, updateModal } = useModal();
  const handleKeyEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyEsc, false);

    return () => {
      document.removeEventListener("keydown", handleKeyEsc);
    };
  }, []);

  const isShown = !!contents;

  const handleClose = () => {
    updateModal(null);
  };

  return (
    <>
      <div
        className={[
          styles.background,
          isShown ? styles.backgroundActive : "",
        ].join(" ")}
        onClick={handleClose}
      />
      <div
        className={[styles.contents, isShown ? styles.contentsActive : ""].join(
          " "
        )}
      >
        {contents}
        <button className={styles.modalClose} onClick={handleClose}>
          <i className="fa-solid fa-xmark" style={{ color }} />
        </button>
      </div>
    </>
  );
};
