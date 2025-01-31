"use client";

import { useCallback, useEffect } from "react";
import { useModal } from "src/hooks/useModal";

import styles from "./ModalContents.module.scss";

export type ModalContentsProps = {};

export const ModalContents = ({}: ModalContentsProps) => {
  const { contents, color, updateModal } = useModal();

  const handleClose = useCallback(() => {
    updateModal(null);
  }, [updateModal]);

  const handleKeydownEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeydownEscape, false);

    return () => {
      document.removeEventListener("keydown", handleKeydownEscape);
    };
  }, [handleKeydownEscape]);

  const isShown = !!contents;

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
