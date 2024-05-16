import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PeriodoService } from '../../service/periodo.service';
import { PerDiscMultiSelect, Periodo, PeriodoDisciplina } from '../../models/periodo.models';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { DisciplinaService } from '../../service/disciplina.service';
import { AlunoService } from '../../service/aluno.service';
import { Disciplina } from '../../models/disciplina.models';
import { Aluno } from '../../models/aluno.models';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { MultiSelect } from 'primeng/multiselect';
import { Calendar } from 'primeng/calendar';
import { HomeService } from '../../service/home.service';

@Component({
    selector: 'app-relatorios-r',
    standalone: true,
    imports: [
      CommonModule,
      HttpClientModule,
      RouterModule,
      ReactiveFormsModule,
      FormsModule,
      NgxMaskDirective,
      PrimeNgImportsModule
    ],
    templateUrl: './relatorios-r.component.html',
    styleUrl: './relatorios-r.component.scss',
    providers: [
      PeriodoService,
      ConfirmationService,
      MessageService,
      DisciplinaService,
      AlunoService,
      provideNgxMask(),
      HomeService
    ]
  })

export class RelatoriosRComponent implements OnInit{
    
    anorelatorioArray: number[] = [];
    semestrerelatorioArray: number[] = [];

    selectedAno!: number
    selectedSemestre!: number
    
    messages!: Message[];

    mss: string = '';

    constructor(
      private homService: HomeService
    ) {}

    ngOnInit() {
      
      let anoAtual = new Date(); 
      
      for (let index = 0; index < 5; index++) {
        
        let ano = anoAtual.getFullYear()-index;
        
        this.anorelatorioArray.push(ano)
      }

      
    for (let index = 1; index < 3; index++) {
  
      this.semestrerelatorioArray.push(index)
    }

    }

    onSubmitDisciplinas(){
        console.log(this.selectedAno)
        console.log(this.selectedSemestre)
        if (this.selectedAno && this.selectedSemestre){
        this.mss = 'Aguarde seu arquivo está sendo baixado...';
        
        this.homService.gerarRelatorioDisciplinaTurma(this.selectedAno, this.selectedSemestre).subscribe(
          // (resposta: string) => {
          //   console.log('Resposta do back-end:', resposta);
          // },
          // (erro) => {
          //   console.error('Erro ao chamar o serviço:', erro);
          // }
          {next: (data) => {
            console.log('generico 1')
            this.messages = [
              { severity: 'success', summary: 'Sucesso', detail: data, life: 3000 },
            ];
          },
          error: (err) => {
            console.log('generico 2')
            console.log(err)
            this.messages = [
              { severity: 'success', summary: 'Sucesso', detail: 'Relatório gerado com sucesso em: C:/Downloads', life: 3000 },
            ];
            this.mss = '';
            // if (err.status === 400) {
            //   this.messages = [
            //     { severity: 'error', summary: 'Erro', detail: err, life: 3000 },
            //   ];
            // } else {
            // }
          }}
        );
      } else {
        this.messages = [
          { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Selecione os campos!', life: 3000 },
        ];
      }

    }

    }