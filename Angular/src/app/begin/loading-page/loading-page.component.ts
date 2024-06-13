import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DisciplinaService } from '../../service/disciplina.service';
import { Disciplina } from '../../models/postgres/disciplina.models';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-loading-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    PrimeNgImportsModule
  ],
  templateUrl: './loading-page.component.html',
  styleUrl: './loading-page.component.scss',
  providers: [
    DisciplinaService
  ]

})
export class LoadingPageComponent implements OnInit{
  products: Disciplina[] = [];

  selectedProducts: Disciplina[] = [];

  mostrarR: boolean = false
  items: MenuItem[];

  constructor(
    private disciService: DisciplinaService
  ) {
    this.items = [
      {
          label: 'Excluir',
          badge: `${this.selectedProducts.length}`
          },
          {
            label: 'Gerar código',
            badge: `${this.selectedProducts.length}`
      }
    ]
  }

  ngOnInit() {
    this.products = [
      {
        id: 0,
        nome: 'Disc 1',
        sigla: 'd1'
      },
      {
        id: 1,
        nome: 'Disc 2',
        sigla: 'd2'
      },
      {
        id: 2,
        nome: 'Disc 3',
        sigla: 'd3'
      },
      {
        id: 3,
        nome: 'Disc 4',
        sigla: 'd4'
      },
    ]
  }

  showSelectedProducts(): void {
    this.mostrarR = !this.mostrarR
  }
}
