import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { Subscription, filter } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { LoginResponseDTO } from '../../models/authentication';
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
    UsuarioService
  ]
})
export class NavHeaderComponent implements OnInit {
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
    private router: Router
  ) {
    // this.router.events
    //   .pipe(filter(event => event instanceof NavigationEnd))
    //   .subscribe(() => {
    //     this.isSpecialPage = this.specialKeywords.some(keyword => this.router.url.includes(keyword));
    // });
  }

  ngOnInit() {
    this.itemsOptionsUser = [
      {
        label: this.getNameUser(),
        // routerLink:'home',
        // style: {
        //   'font-size': '1.4rem',
        //   'font-family': 'Grandstander Semi'
        // },
        items: [
          {
            label: 'Data logs',
            routerLink:'home',
          },
          { 
            separator: true 
          },
          {
            label: 'Sair',
            command: () => this.logout()
          },
        ]
      }
    ];

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
  }

  isLogged() {
    return this.userAuthService.isLoggedIn();
  }

  logout() {
    this.userAuthService.clear();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  getNameUser() {
    return this.userAuthService.getNome();
  }

  togglePanel() {
    this.panelVisible = !this.panelVisible;
  }

}
