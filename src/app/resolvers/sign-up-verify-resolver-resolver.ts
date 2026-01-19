import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {map, of, catchError, tap, filter} from "rxjs"

export const signUpVerifyResolverResolver: ResolveFn<String> = (route, state) => {
  const activatedRoute = inject(ActivatedRoute);
  return activatedRoute.queryParams.pipe(
    tap(params => console.log("here params")),
    filter(params => !!params["verifytoken"]),
    tap(params => console.log("after filter")),
    map(params => {
      console.log(params["verifytoken"])
      return params["verifytoken"]
    })
)
};
