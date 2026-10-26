// 파일 책임: jsdom으로 볼 수 없는 키트 보장을 실제 브라우저에서 관찰한다 — 여러 탭의 세션, 진입 주소 정규화와 요청 순서, 결과가 있을 때의 재조회 실패.
import { expect, test, type Page } from '@playwright/test';

/** mock 계정으로 로그인하고 상품 목록이 보일 때까지 기다린다. */
async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('아이디').fill('admin');
  await page.getByLabel('비밀번호').fill('password');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/products$/);
}

/** 이 페이지의 API 요청과 성공 응답을 일어난 순서대로 "→ METHOD /path?query" · "← 200 /path"로 기록한다. */
function recordApi(page: Page) {
  const events: string[] = [];
  const line = (url: URL) => `${url.pathname}${decodeURIComponent(url.search)}`;
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith('/api/')) events.push(`→ ${request.method()} ${line(url)}`);
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.pathname.startsWith('/api/') && response.status() === 200) events.push(`← 200 ${url.pathname}`);
  });
  return events;
}

test('signing out in one tab ends the session in the other tab', async ({ context }) => {
  const first = await context.newPage();
  await signIn(first);
  const second = await context.newPage();
  await second.goto('/products');
  await expect(second.getByRole('cell', { name: 'Mouse Pad' })).toBeVisible();

  await first.getByRole('button', { name: '로그아웃' }).click();

  await expect(second).toHaveURL(/\/login\?reason=other-tab/);
  await expect(second.getByText('다른 탭에서 로그아웃했습니다.')).toBeVisible();
});

test('an entry URL with unknown values is replaced and the list waits for the options', async ({ page }) => {
  await signIn(page);
  const events = recordApi(page);
  await page.goto('/products?keyword=a&categoryId=c-gone&statuses=ACTIVE,BOGUS&sort=color');

  await expect(page).toHaveURL(/\/products\?keyword=a$/);
  await expect(page.getByRole('cell').first()).toBeVisible();
  const products = events.filter((event) => event.startsWith('→ GET /api/products'));
  // 없는 분류는 선택지를 받은 뒤 버려지고, 목록 요청은 고친 조건으로만, 선택지 응답 뒤에 나간다.
  expect(products.length).toBeGreaterThan(0);
  expect(products.every((event) => !event.includes('categoryId') && !event.includes('BOGUS'))).toBe(true);
  expect(events.indexOf(products[0]!)).toBeGreaterThan(events.indexOf('← 200 /api/categories'));
  expect(events.indexOf('← 200 /api/categories')).toBeGreaterThan(-1);
});

test('a failed background refresh keeps the rows and offers a retry', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('cell', { name: 'Mouse Pad' })).toBeVisible();
  // mock 서버(이 페이지의 msw)를 내려 같은 조건 재조회를 실패시킨다.
  await page.evaluate(async () => {
    // 개발 서버가 앱과 같은 모듈 인스턴스로 내주는 경로다(브라우저 안에서만 존재).
    const dbModule = '/src/mocks/db.ts';
    const { mockDb } = (await import(/* @vite-ignore */ dbModule)) as { mockDb: object };
    Object.defineProperty(mockDb, 'products', { get: () => { throw new Error('mock server down'); }, configurable: true });
  });
  await page.getByRole('button', { name: '검색' }).click();

  await expect(page.getByText('최신 내용을 불러오지 못했습니다.', { exact: false })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Mouse Pad' })).toBeVisible();
  await expect(page.getByRole('button', { name: '다시 시도' })).toBeVisible();
});
