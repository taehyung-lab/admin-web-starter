// 파일 책임: 체크박스 표현(Base UI Checkbox). 선택 상태와 의미는 호출부가 정한다.
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';

/** 체크·부분 선택 표시를 가진 체크박스. 보이는 라벨이 없으면 label을 접근 가능한 이름으로 쓴다. */
export function Checkbox({
  checked,
  indeterminate = false,
  disabled = false,
  label,
  onCheckedChange,
}: {
  readonly checked: boolean;
  readonly indeterminate?: boolean;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <BaseCheckbox.Root
      checked={checked}
      indeterminate={indeterminate}
      disabled={disabled}
      aria-label={label}
      onCheckedChange={(next) => onCheckedChange(next)}
      className="flex size-4 shrink-0 items-center justify-center rounded border border-slate-400 bg-white data-[checked]:border-slate-900 data-[checked]:bg-slate-900 data-[indeterminate]:border-slate-900 data-[indeterminate]:bg-slate-900 data-[disabled]:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
    >
      <BaseCheckbox.Indicator className="text-white">
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
          {indeterminate ? (
            <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}
