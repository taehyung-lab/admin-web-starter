// 파일 책임: 저장하지 않은 변경이 있을 때 화면 이탈을 묻는다(TanStack Router blocker + ConfirmDialog). 언제 막을지는 호출부가 정한다.
import { useBlocker } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from './ConfirmDialog';

/** when이 참인 동안 route 이동과 새로고침을 막고 확인을 받는다. 저장 뒤 이동은 ignoreBlocker로 지나간다. */
export function LeaveGuard({ when }: { readonly when: boolean }) {
  const { t } = useTranslation();
  const blocker = useBlocker({ shouldBlockFn: () => when, enableBeforeUnload: () => when, withResolver: true });
  return (
    <ConfirmDialog
      open={blocker.status === 'blocked'}
      pending={false}
      title={t('common.unsavedTitle')}
      confirmLabel={t('common.leave')}
      cancelLabel={t('common.stay')}
      tone="danger"
      onConfirm={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
    >
      {t('common.unsavedBody')}
    </ConfirmDialog>
  );
}
