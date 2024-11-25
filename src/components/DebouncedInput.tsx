"use client";

import { ChangeEvent, useState } from "react";

export type DebouncedInputProps = {
  defaultValue: string;
  handleChange: (value: string) => void;
  bounceTime?: number;
};

export const DebouncedInput = ({
  defaultValue,
  handleChange,
  bounceTime = 700,
}: DebouncedInputProps) => {
  const [text, setText] = useState<string>(defaultValue);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const handleChangeDebounced = (e: ChangeEvent<HTMLInputElement>) => {
    const currentText = e.target.value;
    setText(currentText);
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    const currentTimer = setTimeout(() => {
      handleChange(currentText);
    }, bounceTime);
    setTimer(currentTimer);
  };

  return <input type="text" value={text} onChange={handleChangeDebounced} />;
};
