// 파일 책임: 폼 필드 adapter. 라벨·설명·오류의 접근성 연결은 web-kit FieldFrame이 맡고, 여기서는 모양과 입력 control만 정한다.
import { Input } from '@base-ui/react/input';
import { FieldFrame, type FieldControlProps } from '@boosterlab/web-kit/form/ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/cn';

const FRAME_CLASSES = {
  root: 'flex flex-col gap-1.5',
  label: 'text-sm font-medium text-slate-800',
  required: 'ml-0.5 text-rose-600',
  description: 'text-xs text-slate-500',
  error: 'text-xs font-medium text-rose-600',
};

const CONTROL =
  'w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 ' +
  'focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 disabled:bg-slate-50 ' +
  'aria-[invalid=true]:border-rose-500 aria-[invalid=true]:ring-rose-500/15';

/**
 * 필드 하나. id는 useSaveForm의 fieldId(name)(= formFieldControlId)로 받고 control에 그대로 넘긴다.
 * message는 이미 번역된 오류 문구다.
 */
export function Field({
  id,
  label,
  required = false,
  description,
  message,
  children,
}: {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly description?: string;
  readonly message?: string;
  readonly children: (control: FieldControlProps) => ReactNode;
}) {
  return (
    <FieldFrame id={id} label={label} required={required} description={description} message={message} classes={FRAME_CLASSES}>
      {(control) => children(control)}
    </FieldFrame>
  );
}

/** 한 줄 입력(Base UI Input). */
export function TextInput({ className, ...props }: Omit<ComponentProps<typeof Input>, 'className'> & { readonly className?: string }) {
  return <Input className={cn(CONTROL, 'h-9', className)} {...props} />;
}

/** 여러 줄 입력. */
export function TextArea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(CONTROL, 'min-h-24 py-2', className)} {...props} />;
}

/** 단일 선택(네이티브 select, 키보드·스크린리더 기본 동작 유지). */
export function SelectInput({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(CONTROL, 'h-9 pr-8', className)} {...props} />;
}
