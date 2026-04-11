"use client";

import { PropsWithChildren } from "react";
import { modalContext, useModalState } from "src/hooks/useModal";

export const ModalProvider = ({ children }: PropsWithChildren<unknown>) => {
  const modal = useModalState();
  return (
    <modalContext.Provider value={modal}>{children}</modalContext.Provider>
  );
};
