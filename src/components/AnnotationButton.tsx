"use client";

import { ReactNode } from "react";
import { useModal } from "src/hooks/useModal";

type Props = {
  label: string;
  children: ReactNode;
  className?: string;
};

export const AnnotationButton = ({ label, children, className }: Props) => {
  const { updateModal } = useModal();
  return (
    <button type="button" className={className} onClick={() => updateModal(children)}>
      <span>{label}</span>
      <i className="hint">?</i>
    </button>
  );
};
