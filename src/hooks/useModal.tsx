"use client";

import { createContext, ReactNode, useContext, useState } from "react";

type ModalContextProps = {
  contents: ReactNode;
  color?: string;
  updateModal: (contents: ReactNode, color?: string) => void;
  clearModal: () => void;
};

export const modalContext = createContext<ModalContextProps>({
  contents: <></>,
  color: "",
  updateModal: () => {},
  clearModal: () => {},
});

export const useModalState = () => {
  const [contents, setContents] = useState<ReactNode>(null);
  const [color, setColor] = useState<string | undefined>("#454545");

  const updateModal = (contents: ReactNode, color?: string) => {
    setContents(contents);
    setColor(color);
  };

  const clearModal = () => {
    setContents("");
    setColor("#454545");
  };

  return { contents, color, updateModal, clearModal };
};

export const useModal = (): ModalContextProps => useContext(modalContext);
