// 파일 책임: 실패 자리의 "다시 시도" 버튼과 성공 뒤 focus 이동. 버튼에 focus가 있던 채로 사라질 때만 controlId로 focus를 옮긴다.
import { useCallback, useLayoutEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

/** failed면 실패 문구와 다시 시도 버튼, 아니면 children(controlId를 가진 요소 포함)을 그린다. */
export function RetryRegion({
  failed,
  message,
  onRetry,
  controlId,
  children,
}: {
  readonly failed: boolean;
  readonly message?: string;
  readonly onRetry: () => void;
  readonly controlId: string;
  readonly children: ReactNode;
}) {
  const { t } = useTranslation();
  const moveFocus = useRef(false);
  // 버튼이 DOM에서 떨어지기 직전(ref 해제 시점)에 focus를 가졌는지 기록한다.
  const retryRef = useCallback((node: HTMLElement | null) => {
    if (node === null) return;
    return () => {
      moveFocus.current = document.activeElement === node;
    };
  }, []);
  useLayoutEffect(() => {
    if (failed || !moveFocus.current) return;
    moveFocus.current = false;
    document.getElementById(controlId)?.focus();
  }, [failed, controlId]);

  if (!failed) return children;
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-rose-200 bg-rose-50/50 px-6 py-10 text-center">
      {message === undefined ? null : <p className="text-sm text-rose-700">{message}</p>}
      <Button ref={retryRef} variant="secondary" onClick={onRetry}>
        {t('common.retry')}
      </Button>
    </div>
  );
}
