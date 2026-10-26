// 파일 책임: 상품 수정 화면. 원본은 useRecord로 받고, 저장 전 확인창(stage)을 거쳐 같은 snapshot으로 저장한다.
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { LeaveGuard } from '@/shared/ui/LeaveGuard';
import { RecordStateBoundary } from '@/shared/ui/RecordStateBoundary';
import { Button } from '@/shared/ui/Button';
import { useSaveForm } from '@boosterlab/web-kit/form';
import { useRecord } from '@boosterlab/web-kit/record';
import { useTranslation } from 'react-i18next';
import { productQuery, useUpdateProduct } from '../api/products';
import { productFieldError, productFormSchema, toProductFormValues, toProductUpsertRequest } from '../model/form';
import type { Product } from '../model/product';
import { ProductForm } from './ProductForm';

/** 수정 화면. 원본이 없으면(missing) 목록으로 돌아가는 수단을 준다. */
export function ProductEditScreen({
  productId,
  onSaved,
  onCancel,
  onBack,
}: {
  readonly productId: string;
  readonly onSaved: () => void;
  readonly onCancel: () => void;
  readonly onBack: () => void;
}) {
  const { t } = useTranslation();
  const state = useRecord(productQuery(productId), productId);
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-slate-900">{t('products.form.editTitle')}</h1>
      <RecordStateBoundary
        state={state}
        missingAction={() => (
          <Button variant="secondary" onClick={onBack}>
            {t('products.backToList')}
          </Button>
        )}
      >
        {(product) => <ProductEditForm product={product} onSaved={onSaved} onCancel={onCancel} />}
      </RecordStateBoundary>
    </div>
  );
}

/** 원본이 준비된 뒤의 수정 폼과 저장 확인창. */
function ProductEditForm({ product, onSaved, onCancel }: { readonly product: Product; readonly onSaved: () => void; readonly onCancel: () => void }) {
  const { t } = useTranslation();
  const update = useUpdateProduct(product.id);
  const saveForm = useSaveForm({
    schema: productFormSchema,
    source: { id: product.id, values: toProductFormValues(product) },
    confirm: true,
    save: async (output) => ({ saved: toProductFormValues(await update.mutateAsync(toProductUpsertRequest(output))) }),
    fieldError: productFieldError,
    onSaved,
  });
  const { stage } = saveForm;
  return (
    <>
      <ProductForm saveForm={saveForm} submitLabel={t('products.form.submitEdit')} onCancel={onCancel} />
      <ConfirmDialog
        open={stage.kind !== 'idle'}
        pending={saveForm.isSaving}
        title={t('products.form.confirmTitle')}
        confirmLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => void saveForm.confirm()}
        onCancel={saveForm.cancel}
      >
        {stage.kind === 'idle' ? null : (
          <>
            <p>{t('products.form.confirmBody')}</p>
            <dl className="mt-3 grid grid-cols-[6rem_1fr] gap-x-3 gap-y-1 rounded-md bg-slate-50 p-3 text-slate-800">
              <dt className="text-slate-500">{t('products.fields.name')}</dt>
              <dd>{stage.values.name}</dd>
              <dt className="text-slate-500">{t('products.fields.code')}</dt>
              <dd>{stage.values.code}</dd>
              <dt className="text-slate-500">{t('products.fields.price')}</dt>
              <dd>{stage.values.price}</dd>
            </dl>
          </>
        )}
      </ConfirmDialog>
      <LeaveGuard when={saveForm.isDirty && stage.kind !== 'confirming'} />
    </>
  );
}
