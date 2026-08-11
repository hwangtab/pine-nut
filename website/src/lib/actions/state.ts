// React 19의 <form action={fn}>은 액션이 호출되는 순간 폼 리셋을 예약한다.
// 성공/실패를 가리지 않으므로, 서버 검증에 걸리면 비제어 입력(defaultValue)에
// 작성해 둔 내용이 통째로 사라진다. 에러와 함께 제출값을 돌려주고 폼이 그 값을
// 새 defaultValue로 다시 그리게 해서 입력을 보존한다.
export type ActionState =
  | { error: string; values?: Record<string, string> }
  | null;

/** FormData에서 문자열 필드만 골라 폼 복원용 스냅샷을 만든다(File 등은 제외). */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}
