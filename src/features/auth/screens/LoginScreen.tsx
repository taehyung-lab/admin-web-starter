// 파일 책임: 로그인 화면. 자격증명 거절(401)은 입력 아래 한 줄로, 그 밖의 실패는 실패 종류 문구로 보인다. 세션 시작은 onSignedIn이 맡는다.
import { failureCopyKey } from '@/shared/lib/failure-copy';
import { formMessages, useFieldMessage } from '@/shared/lib/form-messages';
import { Button } from '@/shared/ui/Button';
import { Field, TextInput } from '@/shared/ui/Field';
import { isRequestFailure } from '@boosterlab/web-kit/failure';
import { useSaveForm } from '@boosterlab/web-kit/form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { signIn } from '../api/auth';

const schema = z.object({
  loginId: z.string().trim().min(1, formMessages.encode('auth.required.loginId')),
  password: z.string().min(1, formMessages.encode('auth.required.password')),
});

/** 로그인 폼. notice는 세션 종료 사유처럼 이 화면에 들어온 이유를 보인다. */
export function LoginScreen({
  notice,
  showMockHint,
  onSignedIn,
}: {
  readonly notice?: string;
  readonly showMockHint: boolean;
  readonly onSignedIn: (accessToken: string) => void;
}) {
  const { t } = useTranslation();
  const message = useFieldMessage();
  const saveForm = useSaveForm({
    schema,
    source: { id: 'login', values: { loginId: '', password: '' } },
    // 저장 결과(access 토큰)는 onSaved가 그대로 받는다.
    save: async (values) => ({ accessToken: await signIn(values.loginId, values.password) }),
    onSaved: (result) => onSignedIn(result.accessToken),
  });
  const { form, fieldId, failure } = saveForm;
  const rejected = isRequestFailure(failure) && failure.kind === 'unauthorized';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">{t('auth.title')}</h1>
        {notice === undefined ? null : (
          <p role="status" className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {notice}
          </p>
        )}
        <form
          noValidate
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void saveForm.submit();
          }}
        >
          <form.Field name="loginId">
            {(field) => (
              <Field id={fieldId('loginId')} label={t('auth.loginId')} required message={message(field.state.meta.errors)}>
                {(control) => (
                  <TextInput
                    {...control}
                    autoFocus
                    autoComplete="username"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </Field>
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <Field id={fieldId('password')} label={t('auth.password')} required message={message(field.state.meta.errors)}>
                {(control) => (
                  <TextInput
                    {...control}
                    type="password"
                    autoComplete="current-password"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </Field>
            )}
          </form.Field>
          {failure === undefined ? null : (
            <p role="alert" className="text-sm font-medium text-rose-600">
              {rejected ? t('auth.credentialRejected') : t(failureCopyKey(failure))}
            </p>
          )}
          <Button variant="primary" type="submit" disabled={saveForm.isSaving} className="mt-2 h-10">
            {t('auth.submit')}
          </Button>
          {showMockHint ? <p className="text-center text-xs text-slate-400">{t('auth.mockHint')}</p> : null}
        </form>
      </div>
    </main>
  );
}
