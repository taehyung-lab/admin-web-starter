// 파일 책임: 상품 등록 화면. 확인창 없이 저장하고, 저장되면 새 상품 상세로 이동한다.
import { LeaveGuard } from '@/shared/ui/LeaveGuard';
import { useSaveForm } from '@boosterlab/web-kit/form';
import { useTranslation } from 'react-i18next';
import { useCreateProduct } from '../api/products';
import { emptyProductForm, productFieldError, productFormSchema, toProductFormValues, toProductUpsertRequest } from '../model/form';
import { ProductForm } from './ProductForm';

/** 등록 폼. onCreated는 새 상품 id를 받아 이동한다. */
export function ProductCreateScreen({ onCreated, onCancel }: { readonly onCreated: (id: string) => void; readonly onCancel: () => void }) {
  const { t } = useTranslation();
  const create = useCreateProduct();
  const saveForm = useSaveForm({
    schema: productFormSchema,
    source: { id: 'new', values: emptyProductForm },
    save: async (output) => {
      const created = await create.mutateAsync(toProductUpsertRequest(output));
      return { saved: toProductFormValues(created), id: created.id };
    },
    fieldError: productFieldError,
    onSaved: (result) => onCreated(result.id),
  });
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-slate-900">{t('products.form.createTitle')}</h1>
      <ProductForm saveForm={saveForm} submitLabel={t('products.form.submitCreate')} onCancel={onCancel} />
      <LeaveGuard when={saveForm.isDirty} />
    </div>
  );
}
