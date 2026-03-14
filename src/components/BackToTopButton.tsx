"use client";

export const BackToTopButton = () => {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo(0, 0);
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }}
    >
      ▲TOPに戻る
    </a>
  );
};
