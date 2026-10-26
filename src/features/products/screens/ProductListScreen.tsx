// 파일 책임: 상품 목록 화면. 검색 초안·확정·조회 상태·선택·일괄 작업 수명은 web-kit useList가 소유하고, 여기서는 필터 UI와 표를 그린다.
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { SelectInput, TextInput } from '@/shared/ui/Field';
import { FilterMessage } from '@/shared/ui/FilterMessage';
import { RetryRegion } from '@/shared/ui/RetryRegion';
import { DataTable, Pagination, SortHeader, tableColumns } from '@/shared/ui/Table';
import { failureCopyKey } from '@/shared/lib/failure-copy';
import { useConfirmationState } from '@boosterlab/web-kit/dialog';
import { useList } from '@boosterlab/web-kit/list';
import type { UrlSearch } from '@boosterlab/web-kit/search';
import { useQuery } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { categoryOptionsQuery } from '../api/categories';
import { productListQuery, useDeactivateProducts } from '../api/products';
import {
  PAGE_SIZES,
  productListSearch,
  toListProductsParams,
  validateProductListDraft,
  type ProductListSearch,
} from '../model/list-search';
import { PRODUCT_STATUSES, type ProductSummary } from '../model/product';
import { formatDate, formatPrice } from './format';
import { StatusBadge } from './StatusBadge';

const columns = tableColumns<ProductSummary>();

/** 상품 목록. search·navigate는 route가 넘긴 URL 값과 이동 함수다. */
export function ProductListScreen({
  search,
  navigate,
  onOpen,
  onCreate,
}: {
  readonly search: UrlSearch;
  readonly navigate: (next: UrlSearch, options: { readonly replace: boolean }) => void;
  readonly onOpen: (id: string) => void;
  readonly onCreate: () => void;
}) {
  const { t, i18n } = useTranslation();
  const ids = { keyword: useId(), category: useId(), from: useId(), to: useId(), period: useId(), table: useId(), size: useId() };
  const list = useList({
    definition: productListSearch,
    search,
    navigate,
    query: (full) => productListQuery(toListProductsParams(full)),
    rowId: (row) => row.id,
    // 이미 판매 중지된 상품은 일괄 판매 중지 대상이 아니다.
    selectable: (row) => row.status !== 'INACTIVE',
    validateDraft: validateProductListDraft,
  });
  // URL 확인(check)과 같은 queryOptions라 요청을 나눠 쓴다.
  const categories = useQuery(categoryOptionsQuery());
  const categoryName = (id: string) => categories.data?.find((category) => category.id === id)?.name ?? t('common.empty');
  const deactivate = useDeactivateProducts();
  const [doneCount, setDoneCount] = useState<number | undefined>(undefined);
  const bulk = useConfirmationState<readonly string[], unknown>({
    run: async () => {
      const count = await list.selection.run((selected) => deactivate.mutateAsync(selected));
      setDoneCount(count);
    },
    onError: (error) => ({ kind: 'show', failure: error }),
  });
  const { draft } = list;
  // 조회 실패와, 분류 선택지를 못 받아 조회를 보류한 상태(check-failed)는 같은 자리에서 다시 시도한다.
  const { status } = list;
  const retry =
    status.kind === 'failed'
      ? { message: t(failureCopyKey(status.failure)), run: status.retry }
      : status.kind === 'idle' && status.reason === 'check-failed'
        ? { message: t('products.list.optionsFailed'), run: status.resume }
        : undefined;
  const periodIssue = list.issues.find((issue) => issue.field === 'period');
  const sorted = (key: ProductListSearch['sort'], label: string) => (
    <SortHeader label={label} active={list.search.sort === key} order={list.search.order} onSort={(order) => list.setSort(key, order)} />
  );

  const tableColumnsDef = [
    columns.display({
      id: 'select',
      header: () => (
        <Checkbox
          label={t('common.selectPage')}
          checked={list.selection.isAllChecked}
          indeterminate={list.selection.isMixed}
          disabled={!list.isCurrent}
          onCheckedChange={(on) => list.selection.togglePage(on)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          label={t('common.selectRow')}
          checked={list.selection.isChecked(row.original.id)}
          disabled={!list.isCurrent || row.original.status === 'INACTIVE'}
          onCheckedChange={(on) => list.selection.toggleRow(row.original.id, on)}
        />
      ),
    }),
    columns.accessor('name', { header: () => sorted('name', t('products.fields.name')), cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span> }),
    columns.accessor('code', { header: () => t('products.fields.code'), cell: (info) => <code className="text-xs">{info.getValue()}</code> }),
    columns.accessor('status', { header: () => t('products.fields.status'), cell: (info) => <StatusBadge status={info.getValue()} /> }),
    columns.accessor('categoryId', { header: () => t('products.fields.category'), cell: (info) => categoryName(info.getValue()) }),
    columns.accessor('price', { header: () => sorted('price', t('products.fields.price')), cell: (info) => formatPrice(info.getValue(), i18n.language) }),
    columns.accessor('createdAt', { header: () => sorted('createdAt', t('products.fields.createdAt')), cell: (info) => formatDate(info.getValue(), i18n.language) }),
  ];

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{t('products.title')}</h1>
        <Button variant="primary" onClick={onCreate}>
          {t('products.create')}
        </Button>
      </header>

      <form
        role="search"
        aria-label={t('products.filter.legend')}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-[2fr_1fr_2fr_3fr_auto] md:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          list.submit();
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor={ids.keyword} className="text-sm font-medium text-slate-800">
            {t('products.filter.keyword')}
          </label>
          <TextInput
            id={ids.keyword}
            value={draft.keyword ?? ''}
            placeholder={t('products.filter.keywordPlaceholder')}
            onChange={(event) => list.patchDraft({ keyword: event.target.value.trim() === '' ? undefined : event.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={ids.category} className="text-sm font-medium text-slate-800">
            {t('products.filter.category')}
          </label>
          <SelectInput
            id={ids.category}
            disabled={categories.data === undefined}
            value={draft.categoryId ?? ''}
            onChange={(event) => list.patchDraft({ categoryId: event.target.value === '' ? undefined : event.target.value })}
          >
            <option value="">{t('products.filter.allCategories')}</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectInput>
        </div>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium text-slate-800">{t('products.filter.statuses')}</legend>
          <div className="flex h-9 flex-wrap items-center gap-4">
            {PRODUCT_STATUSES.map((status) => (
              <label key={status} className="flex items-center gap-2 text-sm text-slate-700">
                <Checkbox
                  checked={draft.statuses.includes(status)}
                  onCheckedChange={(on) =>
                    list.patchDraft({
                      statuses: PRODUCT_STATUSES.filter((value) => (value === status ? on : draft.statuses.includes(value))),
                    })
                  }
                />
                {t(`products.status.${status}`)}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium text-slate-800">{t('products.filter.period')}</legend>
          <div className="flex items-center gap-2">
            <TextInput
              id={ids.from}
              type="date"
              aria-label={t('products.filter.from')}
              aria-invalid={periodIssue !== undefined}
              aria-describedby={periodIssue === undefined ? undefined : ids.period}
              value={draft.from ?? ''}
              onChange={(event) => list.patchDraft({ from: event.target.value || undefined })}
            />
            <span aria-hidden="true" className="text-slate-400">
              ~
            </span>
            <TextInput
              id={ids.to}
              type="date"
              aria-label={t('products.filter.to')}
              aria-invalid={periodIssue !== undefined}
              aria-describedby={periodIssue === undefined ? undefined : ids.period}
              value={draft.to ?? ''}
              onChange={(event) => list.patchDraft({ to: event.target.value || undefined })}
            />
          </div>
          <FilterMessage id={ids.period} message={periodIssue === undefined ? undefined : t(`products.filter.issue.${periodIssue.code}`)} />
        </fieldset>
        <div className="flex gap-2">
          <Button variant="primary" type="submit">
            {t('products.filter.submit')}
          </Button>
          <Button variant="ghost" onClick={list.reset}>
            {t('products.filter.reset')}
          </Button>
        </div>
      </form>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">{t('products.list.total', { count: list.total })}</p>
          <div className="flex items-center gap-3">
            <Button
              variant="danger"
              disabled={list.selection.selectedIds.length === 0 || list.selection.isRunning}
              onClick={() => bulk.request(list.selection.selectedIds)}
            >
              {t('products.bulk.deactivate', { count: list.selection.selectedIds.length })}
            </Button>
            <label htmlFor={ids.size} className="whitespace-nowrap text-sm text-slate-600">
              {t('products.list.pageSize')}
            </label>
            <SelectInput
              id={ids.size}
              className="w-20"
              value={list.search.pageSize}
              onChange={(event) => list.setSize(Number(event.target.value))}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </SelectInput>
          </div>
        </div>
        {doneCount === undefined ? null : (
          <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {t('products.bulk.done', { count: doneCount })}
          </p>
        )}
        {list.failure === undefined ? null : (
          <div role="status" className="flex items-center justify-between gap-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <span>{t('common.refreshFailed')}</span>
            <Button variant="ghost" onClick={list.refresh}>
              {t('common.retry')}
            </Button>
          </div>
        )}
        {!list.isCurrent && list.rows.length > 0 ? (
          <p role="status" className="text-xs text-slate-500">
            {t('products.list.stale')}
          </p>
        ) : null}

        <RetryRegion
          failed={retry !== undefined}
          message={retry?.message}
          onRetry={retry?.run ?? (() => undefined)}
          controlId={ids.table}
        >
          {list.status.kind === 'empty' ? (
            <p id={ids.table} tabIndex={-1} className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
              {t('products.list.empty')}
            </p>
          ) : list.rows.length > 0 ? (
            <DataTable
              id={ids.table}
              caption={t('products.list.caption')}
              columns={tableColumnsDef}
              rows={list.rows}
              rowId={(row) => row.id}
              dimmed={!list.isCurrent}
              onActivate={(row) => onOpen(row.id)}
            />
          ) : (
            <p role="status" className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
              {t('common.loading')}
            </p>
          )}
        </RetryRegion>
        <Pagination page={list.search.page} pageSize={list.search.pageSize} total={list.total} onPage={list.goToPage} />
      </section>

      <ConfirmDialog
        open={bulk.state.kind === 'open'}
        pending={bulk.state.kind === 'open' && bulk.state.pending}
        title={t('products.bulk.title')}
        confirmLabel={t('products.bulk.confirm')}
        cancelLabel={t('common.cancel')}
        tone="danger"
        onConfirm={() => {
          setDoneCount(undefined);
          void bulk.confirm();
        }}
        onCancel={bulk.close}
      >
        {bulk.state.kind === 'open' ? (
          <>
            <p>{t('products.bulk.body', { count: bulk.state.values.length })}</p>
            {bulk.state.failure === undefined ? null : (
              <p role="alert" className="mt-3 text-sm font-medium text-rose-600">
                {t(failureCopyKey(bulk.state.failure))}
              </p>
            )}
          </>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
