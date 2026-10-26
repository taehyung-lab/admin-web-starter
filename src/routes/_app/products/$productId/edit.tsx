// 파일 책임: 상품 수정 경로. loader는 수정 원본을 미리 받기만 한다.
import { productQuery } from '@/features/products/api/products';
import { ProductEditScreen } from '@/features/products/screens/ProductEditScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/products/$productId/edit')({
  loader: ({ context, params }) => {
    void context.queryClient.prefetchQuery(productQuery(params.productId));
  },
  component: ProductEditRoute,
});

function ProductEditRoute() {
  const { productId } = Route.useParams();
  const navigate = Route.useNavigate();
  const toDetail = (ignoreBlocker: boolean) => void navigate({ to: '/products/$productId', params: { productId }, ignoreBlocker });
  return (
    <ProductEditScreen
      productId={productId}
      // 저장 직후 이동은 이탈 질문을 거치지 않는다.
      onSaved={() => toDetail(true)}
      onCancel={() => toDetail(false)}
      onBack={() => void navigate({ to: '/products' })}
    />
  );
}
