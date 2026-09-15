// A route transition is a visit; React rerenders and refresh() on the same route are not.
export function createPageVisitGuard() {
  let lastPath: string | null = null;
  let hasSeenRoute = false;

  return (path: string | null, isDocumentReload = false, previousPagePath: string | null = null) => {
    if (!path) {
      lastPath = null;
      return false;
    }
    if (path === lastPath) return false;
    const isFirstRoute = !hasSeenRoute;
    hasSeenRoute = true;
    lastPath = path;
    return !(isFirstRoute && isDocumentReload && previousPagePath === path);
  };
}
