// 파일 책임: 상품 등록 경로.
import { ProductCreateScreen } from '@/features/products/screens/ProductCreateScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/products/new')({
  component: ProductCreateRoute,
});

function ProductCreateRoute() {
  const navigate = Route.useNavigate();
  return (
    <ProductCreateScreen
      onCreated={(productId) => void navigate({ to: '/products/$productId', params: { productId } })}
      onCancel={() => void navigate({ to: '/products' })}
    />
  );
}
