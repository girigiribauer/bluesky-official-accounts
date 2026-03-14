"use client";

import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useModal } from "src/hooks/useModal";

import styles from "./ModalContents.module.scss";

export type ModalContentsProps = {};

export const ModalContents = ({}: ModalContentsProps) => {
  const { contents, updateModal } = useModal();
  const pathname = usePathname();

  useEffect(() => {
    updateModal(null);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    document.body.style.overflow = isShown ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isShown]);

  return (
    <div
      className={[styles.overlay, isShown ? styles.overlayActive : ""].join(" ")}
      onClick={handleClose}
    >
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.closeRow}>
          <button className={styles.modalClose} onClick={handleClose} aria-label="閉じる">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className={styles.scrollArea}>
          {contents}
        </div>
      </div>
    </div>
  );
};
