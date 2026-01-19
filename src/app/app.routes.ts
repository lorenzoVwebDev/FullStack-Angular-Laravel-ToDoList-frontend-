import { Routes } from '@angular/router';
import { HomeComponent } from './home.component/home.component';
import { DashboardComponent } from './dashboard.component/dashboard.component';
import { TodolistComponent } from './dashboard.component/dashboard.outlet/todolist.component/todolist.component';
import { MaindashboardComponent } from './dashboard.component/dashboard.outlet/maindashboard.component/maindashboard.component';
import { ContactsComponent } from './dashboard.component/dashboard.outlet/contacts.component/contacts.component';
import { SignupverifyComponent } from '@common/signupverify.component/signupverify.component';
//guards
import { appRedirect } from './guards/matchGuard';
import { SigninComponent } from '@common/signin.component/signin.component';
import { ChangepwrComponent } from '@common/changepwr.component/changepwr.component';
import { SignupComponent } from '@common/signup.component/signup.component';
import { Error500Component } from '@common/error500.component/error500.component';
import { todoListGuard } from './guards/appGuard';
import { loggedInResolver } from './resolvers/loggedInResolver';
import { signUpVerifyResolverResolver } from './resolvers/sign-up-verify-resolver-resolver';
export const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    resolve: {
      loggedInResolver: loggedInResolver
    }
  }, {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [todoListGuard],
    canMatch: [appRedirect],
    resolve: {
      loggedInResolver: loggedInResolver
    },
    children: [{
      path: "maindashboard",
      component: MaindashboardComponent
    }, {
      path: "todolist",
      component: TodolistComponent,
    }, {
      path: "contacts",
      component: ContactsComponent,
    }]
  }, {
    path: "signin",
    component: SigninComponent
  }, {
    path: "signup",
    component: SignupComponent
  },{
    path: "changepwr",
    component: ChangepwrComponent
  }, {
    path: "error500",
    component: Error500Component
  }, {
    path: "signupverify",
    component: SignupverifyComponent
  }
];
