// 파일 책임: 검색 영역 입력 오류 문구. 접근 가능한 표시(role·id)는 web-kit FilterError가 맡고 여기서는 모양만 준다.
import { FilterError } from '@boosterlab/web-kit/filter';

/** id는 해당 입력의 aria-describedby에 연결한다. message는 번역된 문구다. */
export function FilterMessage({ id, message }: { readonly id: string; readonly message?: string }) {
  return <FilterError id={id} message={message} className="text-xs font-medium text-rose-600" />;
}
