// 파일 책임: 표 표현 adapter(TanStack Table v9 core). 행 데이터·선택·정렬 상태는 호출부(web-kit list)가 소유하고, 여기서는 그리기만 한다.
import { activateTableRow } from '@boosterlab/web-kit/list';
import { createColumnHelper, tableFeatures, useTable, type ColumnDef, type RowData } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/cn';
import { Button } from './Button';

/** 서버가 정렬·페이지를 맡으므로 core 기능만 등록한다. */
const features = tableFeatures({});
type Features = typeof features;

// 열마다 값 타입이 달라서 TanStack이 권하는 any 값 타입을 쓴다(columnHelper.columns와 같은 모양).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TableColumn<TRow extends RowData> = ColumnDef<Features, TRow, any>;
/** 열 정의 helper. 화면은 이것으로 columns를 만든다. */
export const tableColumns = <TRow extends RowData>() => createColumnHelper<Features, TRow>();

/** 행 안의 입력(체크박스·링크)을 누르면 행 이동을 하지 않는다. */
const ROW_POLICY = { keys: ['Enter'], interactiveSelector: 'a,button,input,select,textarea,[role="checkbox"]' };

/** 데이터 표. dimmed는 이전 조건의 결과(읽기 전용)를 흐리게 보일 때 쓴다. */
export function DataTable<TRow extends RowData>({
  id,
  caption,
  columns,
  rows,
  rowId,
  dimmed = false,
  onActivate,
}: {
  readonly id?: string;
  readonly caption: string;
  readonly columns: readonly TableColumn<TRow>[];
  readonly rows: readonly TRow[];
  readonly rowId: (row: TRow) => string;
  readonly dimmed?: boolean;
  readonly onActivate?: (row: TRow) => void;
}) {
  const table = useTable({ features, columns: [...columns], data: rows, getRowId: (row) => rowId(row) });
  return (
    <div id={id} tabIndex={-1} className="overflow-x-auto rounded-xl border border-slate-200 bg-white outline-none">
      <table className={cn('w-full text-left text-sm', dimmed && 'opacity-60')}>
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} scope="col" className="px-4 py-2.5 font-medium whitespace-nowrap">
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-100">
          {table.getRowModel().rows.map((row) => {
            const activate = onActivate === undefined ? undefined : () => onActivate(row.original);
            return (
              <tr
                key={row.id}
                tabIndex={activate === undefined ? undefined : 0}
                onClick={(event) => activateTableRow(event, activate, ROW_POLICY)}
                onKeyDown={(event) => activateTableRow(event, activate, ROW_POLICY)}
                className={cn(activate !== undefined && 'cursor-pointer hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none')}
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-slate-700">
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** 정렬 가능한 열 머리글. 현재 정렬이면 방향을 표시하고, 누르면 onSort를 부른다. */
export function SortHeader({
  label,
  active,
  order,
  onSort,
}: {
  readonly label: ReactNode;
  readonly active: boolean;
  readonly order: 'asc' | 'desc';
  readonly onSort: (order: 'asc' | 'desc') => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => onSort(active && order === 'asc' ? 'desc' : 'asc')}
      className="inline-flex items-center gap-1 rounded hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-slate-900"
    >
      {label}
      <span aria-hidden="true" className={cn('text-[10px]', !active && 'opacity-30')}>
        {active && order === 'asc' ? '▲' : '▼'}
      </span>
      {active ? <span className="sr-only">{t(order === 'asc' ? 'common.sortAsc' : 'common.sortDesc')}</span> : null}
    </button>
  );
}

/** 페이지 이동. page는 1부터다. */
export function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly onPage: (page: number) => void;
}) {
  const { t } = useTranslation();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <nav className="flex items-center justify-end gap-2 text-sm text-slate-600">
      <Button variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label={t('common.previousPage')}>
        ‹
      </Button>
      <span>{t('common.pageOf', { page, pages })}</span>
      <Button variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label={t('common.nextPage')}>
        ›
      </Button>
    </nav>
  );
}
