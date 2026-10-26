// 파일 책임: useRecord 상태(pending·missing·failed·ready)를 그리는 표현 adapter. 상태 판정은 web-kit record가 이미 끝냈고 여기서는 다시 판정하지 않는다.
import type { RecordRefresh, RecordState } from '@boosterlab/web-kit/record';
import type { RequestFailure } from '@boosterlab/web-kit/failure';
import { useId, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { failureCopyKey } from '../lib/failure-copy';
import { Button } from './Button';
import { RetryRegion } from './RetryRegion';

/**
 * 단건 화면의 내용 자리. missing은 failure.kind(not-found·forbidden)별 문구와 화면이 준 이동 수단을 보인다.
 * ready에서 재조회 실패는 내용을 지우지 않고 위에 알린다.
 */
export function RecordStateBoundary<T>({
  state,
  missingAction,
  children,
}: {
  readonly state: RecordState<T>;
  readonly missingAction?: (failure: RequestFailure) => ReactNode;
  readonly children: (data: T) => ReactNode;
}) {
  const { t } = useTranslation();
  const contentId = useId();
  if (state.kind === 'missing')
    return (
      <section role="alert" className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
        <p className="text-base font-medium text-slate-800">{t(failureCopyKey(state.failure))}</p>
        {missingAction?.(state.failure)}
      </section>
    );
  return (
    <RetryRegion
      failed={state.kind === 'failed'}
      message={state.kind === 'failed' ? t(failureCopyKey(state.failure)) : undefined}
      onRetry={state.kind === 'failed' ? state.retry : () => undefined}
      controlId={contentId}
    >
      {state.kind === 'pending' ? (
        <p role="status" className="py-16 text-center text-sm text-slate-500">
          {t('common.loading')}
        </p>
      ) : state.kind === 'ready' ? (
        <div id={contentId} tabIndex={-1} className="outline-none">
          <RefreshNotice refresh={state.refresh} />
          {children(state.data)}
        </div>
      ) : null}
    </RetryRegion>
  );
}

/** 준비된 내용 위의 갱신 사실. 실패면 다시 시도할 수 있다. */
function RefreshNotice({ refresh }: { readonly refresh: RecordRefresh }) {
  const { t } = useTranslation();
  if (refresh.failure !== undefined)
    return (
      <div role="status" className="mb-4 flex items-center justify-between gap-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
        <span>{t('common.refreshFailed')}</span>
        <Button variant="ghost" onClick={refresh.retry}>
          {t('common.retry')}
        </Button>
      </div>
    );
  if (refresh.refreshing)
    return (
      <p role="status" className="mb-4 text-xs text-slate-500">
        {t('common.refreshing')}
      </p>
    );
  return null;
}
