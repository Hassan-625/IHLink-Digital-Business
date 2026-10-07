export function businessPortalPath(base: string, page: string): string {
  if (base === '/') return page === 'dashboard' ? '/dashboard' : '/dashboard/' + page;
  return base + '/' + page;
}
