import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleRequest = createMiddleware(routing);

export function proxy(request: Parameters<typeof handleRequest>[0]) {
  return handleRequest(request);
}

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)'],
};
