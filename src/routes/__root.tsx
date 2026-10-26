// 파일 책임: route 트리의 뿌리. router context(QueryClient) 타입을 선언한다. 오류·없음 화면은 router 기본값이 맡는다.
import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

export interface RouterContext {
  readonly queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
});
