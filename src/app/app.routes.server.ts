import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: "",
    renderMode: RenderMode.Prerender
  }, {
    path: "dashboard",
    renderMode: RenderMode.Client
  }, {
    path: "dashboard/todolist",
    renderMode: RenderMode.Client
  }, {
    path: "dashboard/maindashboard",
    renderMode: RenderMode.Client
  }, {
    path: "dashboard/contacts",
    renderMode: RenderMode.Client
  }, {
    path: "signin",
    renderMode: RenderMode.Client
  }, {
    path: "signup",
    renderMode: RenderMode.Client
  },{
    path: "changepwr", 
    renderMode: RenderMode.Client
  }, {
    path: "error500",
    renderMode: RenderMode.Prerender
  }
];
