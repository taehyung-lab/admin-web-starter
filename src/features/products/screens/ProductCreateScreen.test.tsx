// 파일 책임: 상품 등록 화면 검사. 저장 한 번 뒤 onSaved가 받은 새 id의 상세로 이동하는지 관찰한다.
import { mockDb } from '@/mocks/db';
import { renderApp } from '@/test/app';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

describe('product create', () => {
  it('posts once and moves to the new product detail', async () => {
    const user = userEvent.setup();
    const { router, requests } = renderApp('/products/new');

    await user.type(await screen.findByLabelText(/상품명/), 'Desk Organizer');
    await user.type(screen.getByLabelText(/상품 코드/), 'SKU-9001');
    await user.selectOptions(screen.getByLabelText(/분류/), await screen.findByRole('option', { name: 'Living' }));
    await user.click(screen.getByRole('button', { name: '등록' }));

    expect(await screen.findByRole('heading', { name: 'Desk Organizer' })).toBeTruthy();
    const created = mockDb.products.find((product) => product.code === 'SKU-9001');
    await waitFor(() => expect(router.state.location.pathname).toBe(`/products/${created?.productId}`));
    expect(requests.filter((request) => request.line === 'POST /api/products')).toHaveLength(1);
  });
});
