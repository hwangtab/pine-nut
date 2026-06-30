"use client";

import { useRef, type ReactNode } from "react";
import { useEscapeToClose, useFocusTrap } from "./useDialogA11y";

interface AdminDialogFrameProps {
  open: boolean;
  titleId: string;
  descriptionId: string;
  onClose: () => void;
  children: ReactNode;
}

export function AdminDialogFrame({
  open,
  titleId,
  descriptionId,
  onClose,
  children,
}: AdminDialogFrameProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const trapFocus = useFocusTrap();
  useEscapeToClose(open, onClose);

  if (!open) return null;

  const onBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onClick={onBackdropClick}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onKeyDown={(event) => trapFocus(event, dialogRef)}
      >
        {children}
      </div>
    </div>
  );
}
