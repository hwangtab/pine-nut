// 게시판 입력 길이 상한. 폼(maxLength)과 서버 액션(최종 검증)이 함께 쓴다.
// DB CHECK 제약(20261022000100_board_member_fixes.sql)과 값을 맞춰 둔다.
export const BOARD_POST_TITLE_MAX = 200;
export const BOARD_POST_CONTENT_MAX = 20_000;
export const BOARD_COMMENT_MAX = 2_000;
