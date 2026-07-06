export const BOARD_CATEGORIES = ["자유", "질문", "제안", "후기"] as const;
export type BoardCategory = (typeof BOARD_CATEGORIES)[number];
