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
import { AuthGuard } from './_auth/auth.guard';
import { ForbiddenComponent } from './begin/forbidden/forbidden.component';
import { LoggedGuard } from './_auth/logged.guard';
import { HorariosRComponent } from './read/horarios-r/horarios-r.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [LoggedGuard] },
    { path: 'forbidden', component: ForbiddenComponent },
    
    { path: 'home', component: HomeComponent, canActivate:[AuthGuard], data:{roles:["ADMIN", "USER"]} },
    
    { path: 'registrar', component: RegisterComponent, canActivate: [AuthGuard], data:{roles:["ADMIN"]} },
    
    { path: 'equipamentos', component: EquipamentosRComponent, canActivate:[AuthGuard], data:{roles:["ADMIN"]} },
    { path: 'disciplinas', component: DisciplinasRComponent, canActivate:[AuthGuard], data:{roles:["ADMIN"]} },
    { path: 'periodos', component: PeriodosRComponent, canActivate:[AuthGuard], data:{roles:["ADMIN"]} },
    { path: 'professores', component: ProfessoresRComponent, canActivate:[AuthGuard], data:{roles:["ADMIN"]} },
    { path: 'alunos', component: AlunosRComponent, canActivate:[AuthGuard], data:{roles:["ADMIN"]} },
    { path: 'coordenadorias', component: CoordenadoriasRComponent, canActivate:[AuthGuard], data:{roles:["ADMIN"]} },
    { path: 'locais', component: LocaisRComponent, canActivate:[AuthGuard], data:{roles:["ADMIN"]} },
    { path: 'horarios', component: HorariosRComponent, canActivate:[AuthGuard], data:{roles:["ADMIN"]} },
    
    { path: 'eventos', component: EventosRComponent, canActivate:[AuthGuard], data:{roles:["ADMIN"]} },
    { path: 'alocacoes', component: AlocacoesRComponent, canActivate:[AuthGuard], data:{roles:["ADMIN"]} },
];
