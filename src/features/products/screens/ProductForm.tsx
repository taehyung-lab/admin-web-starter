// 파일 책임: 상품 등록·수정이 함께 쓰는 폼 본문. 제출·저장·오류 수명은 web-kit useSaveForm이 소유하고, 여기서는 필드와 폼 수준 문구를 그린다.
import { failureCopyKey } from '@/shared/lib/failure-copy';
import { useFieldMessage } from '@/shared/lib/form-messages';
import { Button } from '@/shared/ui/Button';
import { Field, SelectInput, TextArea, TextInput } from '@/shared/ui/Field';
import { isRequestFailure } from '@boosterlab/web-kit/failure';
import { FormArrayField, type useSaveForm } from '@boosterlab/web-kit/form';
import { useQuery } from '@tanstack/react-query';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { categoryOptionsQuery } from '../api/categories';
import { OPTION_LIMITS, type ProductFormOutput, type ProductFormValues } from '../model/form';
import { PRODUCT_STATUSES, type ProductStatus } from '../model/product';

/** 폼 본문이 읽는 부분만. 등록·수정은 저장 결과 모양(TResult)이 달라도 같은 본문을 쓴다. */
export type ProductSaveForm = Pick<
  ReturnType<typeof useSaveForm<ProductFormValues, ProductFormOutput>>,
  'form' | 'fieldId' | 'failure' | 'unattachedFieldErrors' | 'isSaving' | 'submit'
>;

type TextFieldName = Exclude<keyof ProductFormValues, 'status' | 'categoryId' | 'description' | 'options'>;
type OptionFieldName = `options[${number}].name` | `options[${number}].extraPrice`;

/** 폼 본문. submitLabel은 등록·수정이 다르다. */
export function ProductForm({ saveForm, submitLabel, onCancel }: { readonly saveForm: ProductSaveForm; readonly submitLabel: string; readonly onCancel: () => void }) {
  const { t } = useTranslation();
  const message = useFieldMessage();
  const { form, fieldId } = saveForm;
  const categories = useQuery(categoryOptionsQuery());

  const textField = (name: TextFieldName, options: { readonly description?: string; readonly inputMode?: 'numeric' } = {}) => (
    <form.Field name={name}>
      {(field) => (
        <Field id={fieldId(name)} label={t(`products.fields.${name}`)} required description={options.description} message={message(field.state.meta.errors)}>
          {(control) => (
            <TextInput
              {...control}
              name={name}
              inputMode={options.inputMode}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </Field>
      )}
    </form.Field>
  );

  /** 옵션 한 줄의 입력 칸. Enter는 줄 추가 버튼과 같은 일을 한다. */
  const optionField = (name: OptionFieldName, label: string, props: { readonly inputMode?: 'numeric'; readonly onKeyDown: (event: KeyboardEvent) => void }) => (
    <form.Field name={name}>
      {(field) => (
        <Field id={fieldId(name)} label={label} required message={message(field.state.meta.errors)}>
          {(control) => (
            <TextInput
              {...control}
              name={name}
              inputMode={props.inputMode}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              onKeyDown={props.onKeyDown}
            />
          )}
        </Field>
      )}
    </form.Field>
  );

  // 필드에 붙은 서버 오류는 필드가 보인다. 폼 수준에는 필드 오류가 없는 실패와, 필드에 붙지 못한 오류만 보인다.
  const failure = saveForm.failure;
  const formFailure = failure !== undefined && !(isRequestFailure(failure) && failure.fieldErrors.length > 0 && !failure.resultUnknown);

  return (
    <form
      noValidate
      className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void saveForm.submit();
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        {textField('name')}
        {textField('code', { description: t('products.form.codeDescription') })}
        <form.Field name="status">
          {(field) => (
            <Field id={fieldId('status')} label={t('products.fields.status')} required message={message(field.state.meta.errors)}>
              {(control) => (
                <SelectInput {...control} value={field.state.value} onChange={(event) => field.handleChange(event.target.value as ProductStatus)} onBlur={field.handleBlur}>
                  {PRODUCT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {t(`products.status.${status}`)}
                    </option>
                  ))}
                </SelectInput>
              )}
            </Field>
          )}
        </form.Field>
        <form.Field name="categoryId">
          {(field) => (
            <Field
              id={fieldId('categoryId')}
              label={t('products.fields.category')}
              required
              description={categories.isError ? t('products.form.categoriesFailed') : undefined}
              message={message(field.state.meta.errors)}
            >
              {(control) => (
                <SelectInput
                  {...control}
                  disabled={categories.data === undefined}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                >
                  <option value="">{categories.data === undefined ? t('common.loading') : t('products.form.chooseCategory')}</option>
                  {categories.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </SelectInput>
              )}
            </Field>
          )}
        </form.Field>
        {categories.isError ? (
          <div className="md:col-span-2">
            <Button variant="ghost" onClick={() => void categories.refetch()}>
              {t('common.retry')}
            </Button>
          </div>
        ) : null}
        {textField('price', { inputMode: 'numeric' })}
        {textField('stock', { inputMode: 'numeric' })}
      </div>
      <FormArrayField form={form} name="options" minItems={OPTION_LIMITS.min} maxItems={OPTION_LIMITS.max}>
        {(rows) => {
          const addOption = () => rows.append({ name: '', extraPrice: '0' });
          return (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-sm font-medium text-slate-800">{t('products.fields.options')}</legend>
              {rows.items.map((_, index) => (
                <div key={index} className="grid items-start gap-3 md:grid-cols-[1fr_10rem_auto]">
                  {optionField(`options[${index}].name`, `${t('products.fields.optionName')} ${index + 1}`, { onKeyDown: rows.enterAdds(addOption) })}
                  {optionField(`options[${index}].extraPrice`, `${t('products.fields.optionExtraPrice')} ${index + 1}`, {
                    inputMode: 'numeric',
                    onKeyDown: rows.enterAdds(addOption),
                  })}
                  {rows.canRemove ? (
                    <Button variant="ghost" className="mt-6" onClick={() => rows.remove(index)}>
                      {t('products.form.removeOption', { index: index + 1 })}
                    </Button>
                  ) : null}
                </div>
              ))}
              <Button variant="secondary" className="self-start" disabled={!rows.canAdd} onClick={addOption}>
                {t('products.form.addOption')}
              </Button>
              {message(rows.errors) ? <p role="alert" className="text-sm text-rose-700">{message(rows.errors)}</p> : null}
            </fieldset>
          );
        }}
      </FormArrayField>
      <form.Field name="description">
        {(field) => (
          <Field id={fieldId('description')} label={t('products.fields.description')} message={message(field.state.meta.errors)}>
            {(control) => <TextArea {...control} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} onBlur={field.handleBlur} />}
          </Field>
        )}
      </form.Field>

      {formFailure ? (
        <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {t(failureCopyKey(failure))}
        </p>
      ) : null}
      {saveForm.unattachedFieldErrors.length > 0 ? (
        <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {t('failure.unattached')}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
        <Button variant="ghost" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button variant="primary" type="submit" disabled={saveForm.isSaving}>
          {saveForm.isSaving ? t('common.saving') : submitLabel}
        </Button>
      </div>
    </form>
  );
}
