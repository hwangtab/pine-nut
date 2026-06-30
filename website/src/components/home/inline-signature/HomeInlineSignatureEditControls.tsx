import { EditableValue } from "@/components/editable";

const editControlClassName =
  "rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700";

const editableFields = [
  {
    contentKey: "home.cta.inlineNamePlaceholder",
    defaultValue: "이름",
    buttonLabel: "이름 힌트",
  },
  {
    contentKey: "home.cta.inlineEmailPlaceholder",
    defaultValue: "이메일",
    buttonLabel: "이메일 힌트",
  },
  {
    contentKey: "home.cta.inlineErrorName",
    defaultValue: "이름을 입력해주세요.",
    buttonLabel: "이름 오류",
  },
  {
    contentKey: "home.cta.inlineErrorEmail",
    defaultValue: "올바른 이메일 주소를 입력해주세요.",
    buttonLabel: "이메일 오류",
  },
  {
    contentKey: "home.cta.inlineErrorSubmit",
    defaultValue: "서명에 실패했습니다. 다시 시도해주세요.",
    buttonLabel: "제출 오류",
  },
];

export function HomeInlineSignatureEditControls() {
  return (
    <div className="flex flex-wrap justify-center gap-2 pt-2">
      {editableFields.map((field) => (
        <EditableValue
          key={field.contentKey}
          contentKey={field.contentKey}
          defaultValue={field.defaultValue}
          page="home"
          section="cta"
          buttonLabel={field.buttonLabel}
          wrapperClassName="relative"
          buttonClassName={editControlClassName}
        >
          {(value, editButton) => editButton ?? <span>{value}</span>}
        </EditableValue>
      ))}
    </div>
  );
}
