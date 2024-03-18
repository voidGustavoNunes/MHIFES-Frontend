import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { filter } from 'rxjs';

@Component({
  selector: 'app-nav-header',
  standalone: true,
  imports: [
    MenubarModule,
    CommonModule
  ],
  templateUrl: './nav-header.component.html',
  styleUrl: './nav-header.component.scss'
})
export class NavHeaderComponent implements OnInit {
  itemsLog: MenuItem[] | undefined;
  itemsHom: MenuItem[] | undefined;
  isSpecialPage: boolean = false;
  specialKeywords: string[] = ['/login', '/registrar'];

  constructor(private router: Router){

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
          this.isSpecialPage = this.specialKeywords.some(keyword => this.router.url.includes(keyword));
      });
  }

  ngOnInit() {
    this.itemsLog = [
      {
        label: 'Meu Horário IFES',
        routerLink:'home',
        style: {
          'font-size': '1.4rem',
          'font-family': 'Grandstander Semi'
        }
      }
    ]

    this.itemsHom = [
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
        label: 'Cadastros',
        style: {
          'margin-right': '.5rem',
          'font-weight': '600'
        },
        items: [
          {
            label: 'Aluno',
            routerLink:'alunos',
          },
          {
            label: 'Equipamentos',
            routerLink:'equipamentos',
          },
          {
            label: 'Coordenador',
            routerLink:'coordenador',
          },
          {
            label:'Professor',
            routerLink:'professor',
          },

        ]
      },
      {
        label: 'Aulas do semestre',
        style: {
          'margin-right': '.5rem',
          'font-weight': '600'
        },
        items: [
          {
            label: 'Disciplinas',
            routerLink:'disciplinas',
          },
          {
            label: 'Períodos',
            routerLink:'periodos',
          }
        ]
      }
    ]
  }
}
