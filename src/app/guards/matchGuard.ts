import { inject } from "@angular/core";
import { CanMatchFn, RedirectCommand, UrlSegment } from "@angular/router";
import { Route, Router } from "@angular/router";

export const appRedirect: CanMatchFn = (route: Route, segment: UrlSegment[]) => {
  const router = inject(Router)
  if (segment.length > 1 && route.path === 'dashboard') return true
  const urlTree = router.parseUrl('dashboard/maindashboard');
  return new RedirectCommand(urlTree)
}