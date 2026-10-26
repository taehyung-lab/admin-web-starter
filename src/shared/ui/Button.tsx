// 파일 책임: 프로젝트 버튼 표현(Base UI Button + Tailwind). 동작은 호출부가 정한다.
import { Button as BaseButton } from '@base-ui/react/button';
import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

const VARIANTS = {
  primary: 'bg-slate-900 text-white hover:bg-slate-700 disabled:bg-slate-400',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:text-slate-400',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 disabled:bg-rose-300',
  ghost: 'text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
} as const;

/** 변형 이름 하나로 버튼 모양을 고른다. 기본 type은 button이다. */
export function Button({
  variant = 'secondary',
  className,
  type = 'button',
  ...props
}: Omit<ComponentProps<typeof BaseButton>, 'className'> & {
  readonly className?: string; readonly variant?: keyof typeof VARIANTS; readonly type?: 'button' | 'submit' }) {
  return (
    <BaseButton
      type={type}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3.5 text-sm font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
