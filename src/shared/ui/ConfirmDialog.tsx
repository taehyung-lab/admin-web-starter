// 파일 책임: 확인창 adapter(Base UI AlertDialog). 열림은 open만 따르고, 닫기 요청(취소·Escape)은 onCancel로만 보낸다.
// 실행 중(pending)에는 닫기·재확인을 막는다. 무엇을 실행할지(stage·확인 상태)는 web-kit form/dialog가 소유한다.
import { AlertDialog } from '@base-ui/react/alert-dialog';
import type { ReactNode } from 'react';
import { Button } from './Button';

/** stage가 연 확인창 하나. children은 확인할 내용(snapshot 요약·실패 문구)이다. */
export function ConfirmDialog({
  open,
  pending,
  title,
  confirmLabel,
  cancelLabel,
  tone = 'primary',
  onConfirm,
  onCancel,
  children,
}: {
  readonly open: boolean;
  readonly pending: boolean;
  readonly title: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly tone?: 'primary' | 'danger';
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly children: ReactNode;
}) {
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && !pending) onCancel();
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-slate-950/40 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <AlertDialog.Popup
          aria-busy={pending}
          className="fixed top-1/2 left-1/2 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl outline-none"
        >
          <AlertDialog.Title className="text-base font-semibold text-slate-900">{title}</AlertDialog.Title>
          <div className="mt-2 text-sm text-slate-600">{children}</div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" disabled={pending} onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button variant={tone} disabled={pending} onClick={onConfirm}>
              {pending ? <Spinner /> : null}
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/** 실행 중 표시. 버튼 문구는 바꾸지 않는다. */
function Spinner() {
  return <span aria-hidden="true" className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}
