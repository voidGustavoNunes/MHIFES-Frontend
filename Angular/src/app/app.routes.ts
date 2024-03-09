import { Routes } from '@angular/router';
import { HomeComponent } from './begin/home/home.component';
import { LoginComponent } from './begin/login/login.component';
import { EquipamentosRComponent } from './read/equipamentos-r/equipamentos-r.component';
import { RegisterComponent } from './begin/register/register.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    // { path: 'login', component: LoginComponent, canActivate: [LoggedGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'registrar', component: RegisterComponent },
    { path: 'home', component: HomeComponent },
    { path: 'equipamentos', component: EquipamentosRComponent },
];
