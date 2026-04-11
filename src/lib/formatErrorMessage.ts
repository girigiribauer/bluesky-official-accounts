export const formatErrorMessage = (err: unknown): string => {
  if (err instanceof Error && err.name === "AbortError") {
    return "タイムアウトしました。時間をおいて再度お試しください。";
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "送信に失敗しました。時間をおいて再度お試しください。";
};
