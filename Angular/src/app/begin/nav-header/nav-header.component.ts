import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { Subscription, filter } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { LoginResponseDTO } from '../../models/usuario';
import { UserAuthService } from '../../_services/user-auth.service';
import { UsuarioService } from '../../_services/usuario.service';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-nav-header',
  standalone: true,
  imports: [
    CommonModule,
    MenubarModule,
    HttpClientModule,
    ButtonModule,
    FormsModule,
    OverlayPanelModule,
    DividerModule
  ],
  templateUrl: './nav-header.component.html',
  styleUrl: './nav-header.component.scss',
  providers: [
    UserAuthService,
    UsuarioService,
    // Window,
    // { provide: Window, useValue: window }
  ]
})
export class NavHeaderComponent implements OnInit, OnDestroy {
  itemsLog: MenuItem[] | undefined;
  itemsAdm: MenuItem[] | undefined;
  itemsUse: MenuItem[] | undefined;
  // isSpecialPage: boolean = false;
  // specialKeywords: string[] = ['/login', '/registrar'];
  
  unsubscribe$!: Subscription;

  userLogged!: LoginResponseDTO;

  panelVisible: boolean = false;

  itemsOptionsUser: MenuItem[] | undefined;

  constructor(
    private userAuthService: UserAuthService,
    public userService: UsuarioService,
    public router: Router,
    // @Inject(Window) private window: Window
    // private window: Window
  ) {
    // this.router.events
    //   .pipe(filter(event => event instanceof NavigationEnd))
    //   .subscribe(() => {
    //     this.isSpecialPage = this.specialKeywords.some(keyword => this.router.url.includes(keyword));
    // });
  }

  ngOnInit() {

    this.itemsLog = [
      {
        label: 'Meu Horário IFES',
        // routerLink:'home',
        style: {
          'font-size': '1.4rem',
          'font-family': 'Grandstander Semi'
        }
      }
    ]

    this.itemsAdm = [
      {
        label: 'Meu Horário IFES',
        style: {
          'font-size': '1.4rem',
          'margin-right': '2rem',
          'font-family': 'Grandstander Semi'
        }
      },
      {
        label: 'Home',
        routerLink:'home',
        style: {
          'margin-right': '.5rem',
          'font-weight': '600'
        }
      },
      {
        label: 'Gerenciar pessoas',
        style: {
          'margin-right': '.5rem',
          'font-weight': '600'
        },
        items: [
          {
            label: 'Alunos',
            routerLink:'alunos',
          },
          {
            label:'Professores',
            routerLink:'professores',
          },
          {
            label: 'Coordenadorias',
            routerLink:'coordenadorias',
          },
          {
            label: 'Usuários',
            routerLink:'registrar',
          },
        ]
      },
      {
        label: 'Gerenciar recursos',
        style: {
          'margin-right': '.5rem',
          'font-weight': '600'
        },
        items: [
          {
            label: 'Equipamentos',
            routerLink:'equipamentos',
          },
          {
            label: 'Disciplinas',
            routerLink:'disciplinas',
          },
          {
            label: 'Períodos',
            routerLink:'periodos',
          },
          {
            label: 'Horários',
            routerLink:'horarios',
          },
          {
            label: 'Locais',
            routerLink:'locais',
          },
          {
            label: 'Eventos',
            routerLink:'eventos',
          },
          {
            label: 'Alocações',
            routerLink:'alocacoes',
          }
        ]
      }
    ]

    this.itemsUse = [
      {
        label: 'Meu Horário IFES',
        style: {
          'font-size': '1.4rem',
          'margin-right': '2rem',
          'font-family': 'Grandstander Semi'
        }
      },
      {
        label: 'Home',
        routerLink:'home',
        style: {
          'margin-right': '.5rem',
          'font-weight': '600'
        }
      }
    ]
    
    // this.window.addEventListener('beforeunload', () => {
    //   this.logout();
    // });
  }
  
  ngOnDestroy(): void {
  }
  
  // @HostListener('window:beforeunload')
  // onBeforeUnload(): void {
  //   this.logout();
  // }

  isLogged() {
    return this.userAuthService.isLoggedIn();
  }

  logout() {
    this.userAuthService.clear();
  }

  getNameUser() {
    if(this.userAuthService.getNome()) return this.userAuthService.getNome();
    return '';
  }

  togglePanel() {
    this.panelVisible = !this.panelVisible;
  }

}
