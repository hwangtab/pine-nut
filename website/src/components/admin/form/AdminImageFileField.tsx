import {
  adminFileInputClassName,
  adminNoticeTextClassName,
  type AdminFormVariant,
} from "./styles";

interface AdminImageFileFieldProps {
  id?: string;
  name?: string;
  label: string;
  variant: AdminFormVariant;
  helperText: string;
  currentImageAlt?: string;
  currentImageUrl?: string;
  currentNotice?: string;
}

export default function AdminImageFileField({
  id = "image_file",
  name = "image_file",
  label,
  variant,
  helperText,
  currentImageAlt = "현재 이미지",
  currentImageUrl,
  currentNotice,
}: AdminImageFileFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-base font-medium text-[var(--color-admin-text)]"
      >
        {label}
      </label>
      {(currentImageUrl || currentNotice) && (
        <div className="mb-3">
          {currentImageUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImageUrl}
                alt={currentImageAlt}
                className="h-20 w-32 rounded-lg border border-[var(--color-admin-border)] object-cover"
              />
            </>
          )}
          {currentNotice && (
            <p className={`mt-1.5 text-sm ${adminNoticeTextClassName(variant)}`}>
              {currentNotice}
            </p>
          )}
        </div>
      )}
      <input
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={adminFileInputClassName(variant)}
      />
      <p className="mt-1.5 text-sm text-[var(--color-admin-muted)]">
        {helperText}
      </p>
    </div>
  );
}
