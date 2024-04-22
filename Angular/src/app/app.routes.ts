import { Routes } from '@angular/router';
import { HomeComponent } from './begin/home/home.component';
import { LoginComponent } from './begin/login/login.component';
import { EquipamentosRComponent } from './read/equipamentos-r/equipamentos-r.component';
import { RegisterComponent } from './begin/register/register.component';
import { DisciplinasRComponent } from './read/disciplinas-r/disciplinas-r.component';
import { PeriodosRComponent } from './read/periodos-r/periodos-r.component';
import { AlunosRComponent } from './read/alunos-r/alunos-r/alunos-r.component';
import { ProfessoresRComponent } from './read/professores-r/professores-r/professores-r.component';
import { EventosRComponent } from './read/eventos-r/eventos-r.component';
import { LocaisRComponent } from './read/locais-r/locais-r.component';
import { CoordenadoriasRComponent } from './read/coordenadorias-r/coordenadorias-r.component';
import { AlocacoesRComponent } from './read/alocacoes-r/alocacoes-r.component';
import { HorariosRComponent } from './read/horarios-r/horarios-r.component';
import { LoggedGuard } from './_guard/logged.guard';
// import { AuthGuard } from './_guard/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    // { path: 'login', component: LoginComponent, canActivate: [LoggedGuard] },
    
    { path: 'home', component: HomeComponent },
    { path: 'registrar', component: RegisterComponent },
    { path: 'equipamentos', component: EquipamentosRComponent },
    { path: 'disciplinas', component: DisciplinasRComponent },
    { path: 'periodos', component: PeriodosRComponent },
    { path: 'professores', component: ProfessoresRComponent },
    { path: 'alunos', component: AlunosRComponent },
    { path: 'coordenadorias', component: CoordenadoriasRComponent },
    { path: 'eventos', component: EventosRComponent },
    { path: 'locais', component: LocaisRComponent },
    { path: 'alocacoes', component: AlocacoesRComponent },
    
    // { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    // { path: 'registrar', component: RegisterComponent, canActivate: [LoggedGuard] },
    // { path: 'equipamentos', component: EquipamentosRComponent, canActivate: [AuthGuard], data: { tipoUsuarioPermitido: [1] } },
    // { path: 'disciplinas', component: DisciplinasRComponent, canActivate: [AuthGuard], data: { tipoUsuarioPermitido: [1] } },
    // { path: 'periodos', component: PeriodosRComponent, canActivate: [AuthGuard], data: { tipoUsuarioPermitido: [1] } },
    // { path: 'professores', component: ProfessoresRComponent, canActivate: [AuthGuard], data: { tipoUsuarioPermitido: [1] } },
    // { path: 'alunos', component: AlunosRComponent, canActivate: [AuthGuard], data: { tipoUsuarioPermitido: [1] } },
    // { path: 'coordenadorias', component: CoordenadoriasRComponent, canActivate: [AuthGuard], data: { tipoUsuarioPermitido: [1] } },
    // { path: 'eventos', component: EventosRComponent, canActivate: [AuthGuard], data: { tipoUsuarioPermitido: [2] } },
    // { path: 'locais', component: LocaisRComponent, canActivate: [AuthGuard], data: { tipoUsuarioPermitido: [1] } },
    // { path: 'alocacoes', component: AlocacoesRComponent, canActivate: [AuthGuard], data: { tipoUsuarioPermitido: [1] } },
];
