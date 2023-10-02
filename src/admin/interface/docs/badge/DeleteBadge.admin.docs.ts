import { BadgeAdminMessage } from '@shared/messages/admin/Badge.admin.messages';

export const deleteBadgeDocs = {
  operation: {
    summary: '뱃지 삭제',
    description: `어드민 권한\n
    id를 parameter로 전달받아 뱃지를 삭제.
  `,
  },
  noContentResponse: {
    description: BadgeAdminMessage.DELETE_BADGE_SUCCESS_MESSAGE,
  },
};
