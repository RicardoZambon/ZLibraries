import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginLayoutComponent } from '../layouts';
import { LoginComponent } from './components';


const routes: Routes = [
  { path: '', component: LoginLayoutComponent, children: [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
  ] },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ]
})
export class SharedAuthModule {}
