import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { HomeService } from '../../service/home.service';
import { AlocacaoService } from '../../service/alocacao.service';
import { Subscription } from 'rxjs';
import { Alocacao } from '../../models/postgres/alocacao.models';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { Coordenadoria } from '../../models/postgres/coordenadoria.models';
import { CoordenadoriaService } from '../../service/coordenadoria.service';
import { Page } from '../../models/share/page.models';

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
      ConfirmationService,
      MessageService,
      provideNgxMask(),
      HomeService,
      AlocacaoService,
      CoordenadoriaService
    ]
  })

export class RelatoriosRComponent implements OnInit,OnDestroy {
    
  anorelatorioArray: number[] = [];
  semestrerelatorioArray: number[] = [];

  selectedAnoDiscp: number | undefined
  selectedSemestreDiscp: number | undefined

  selectedAnoTurma: number | undefined
  selectedSemestreTurma: number | undefined
  selectedTurma: string | undefined

  selectedAnoProf: number | undefined
  selectedSemestreProf: number | undefined
  selectedProf: number | undefined
  selectedCood: number | undefined
  selectedProfLabel: {value: number | undefined, label: string} | undefined
  selectedCoodLabel: {value: number | undefined, label: string} | undefined
  
  messages!: Message[];

  mss: string = '';
  reportData: any;
  
  unsubscribe$!: Subscription;
  alocacoesArray: Alocacao[] = [];
  

  turmasArray: string[] = [];
  
  turmaFilterOptions: FiltrarPesquisa[] = [];
  selectedTurmaFilter!: FiltrarPesquisa;
  
  profFilterOptions: FiltrarPesquisa[] = [];
  selectedProfFilter!: FiltrarPesquisa;
  
  
  unsubscribe$Cood!: Subscription;
  coodArray: [{value: number | undefined, label: string}] = [{value: undefined, label: ''}];
  profArray: [{value: number | undefined, label: string}] = [{value: undefined, label: ''}];

  sizeAcods: number = 0;

  alocacoesPageData!: Page<Alocacao>;
  coordenadoriasPageData!: Page<Coordenadoria>;

  constructor(
    private homService: HomeService,
    private alocService: AlocacaoService,
    private coordaService: CoordenadoriaService
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

    this.turmaFilterOptions = [
      {nome: 'Nenhum', id: 0},
      {nome: 'Turma', id: 1}
    ];
    this.selectedTurmaFilter = this.turmaFilterOptions[0];

    this.profFilterOptions = [
      {nome: 'Nenhum', id: 0},
      {nome: 'Coordenadoria', id: 1},
      {nome: 'Professor', id: 2}
    ];
    this.selectedProfFilter = this.profFilterOptions[0];

    this.unsubscribe$ = this.alocService.listar(0,10)
    .subscribe({
      next: (itens:any) => {
        this.alocacoesPageData = itens
        this.listarPageObj(1)
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro na recuperação de dados.', life: 3000 },
        ];
      }
    });
    
    this.unsubscribe$Cood = this.coordaService.listar(0,10)
    .subscribe({
      next: (itens:any) => {
        this.coordenadoriasPageData = itens
        this.listarPageObj(2)
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro na recuperação de dados.', life: 3000 },
        ];
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.unsubscribe();
    this.unsubscribe$Cood.unsubscribe();
  }
  
  listarPageObj(object: number) {
    if(object == 1) {
      let sizeUm = this.alocacoesPageData.totalElements
      this.alocService.listarInativos(0,sizeUm).subscribe(alcc => this.alocacoesArray = alcc.content);

      const turmasUnique: string[] = [];
      this.alocacoesArray.forEach((alocaAtual) => {
        const jaTurma = turmasUnique.some((sgl) => sgl == alocaAtual.turma);
        if(!jaTurma) {
          turmasUnique.push(alocaAtual.turma);
        }
      });
      this.turmasArray = turmasUnique;
    } else if(object == 2) {
      let sizeDois = this.coordenadoriasPageData.totalElements
      this.coordaService.listar(0,sizeDois).subscribe(cods => cods.content.forEach((dt) =>{
        this.coodArray.push({value: dt.id, label:`${dt.nome}`});
        this.profArray.push({value: dt.coordenador.id, label:`${dt.coordenador.nome}`});
      }))
    }
  }

  onSubmitDisciplinas(){
    if (this.selectedAnoDiscp && this.selectedSemestreDiscp && this.selectedAnoDiscp != undefined && this.selectedSemestreDiscp != undefined){
      this.mss = 'Aguarde seu arquivo está sendo baixado...';
      
      this.homService.gerarRelatorioDisciplinaTurma(this.selectedAnoDiscp, this.selectedSemestreDiscp).subscribe({
        next: (data) => {
          this.mss = '';
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Relatório gerado com sucesso no diretório "Downloads"', life: 3000 },
          ];
        },
        error: (err) => {
          this.mss = '';
          if (err.status === 400) {
            this.messages = [
              { severity: 'error', summary: 'Erro', detail: err, life: 3000 },
            ];
          } else if(err.status === 200) {
            this.messages = [
              { severity: 'success', summary: 'Sucesso', detail: 'Relatório gerado com sucesso em: C:/Downloads', life: 3000 },
            ];
          } else {
            this.messages = [
              { severity: 'error', summary: 'Erro inesperado', detail: 'Ocorreu um erro durante busca do relatório.\nPor favor, tente novamente.', life: 3000 },
            ];
          }
        }
      });
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Selecione os campos!', life: 3000 },
      ];
    }
  }

  onSubmitTurmas(){
    if (this.selectedAnoTurma && this.selectedSemestreTurma && this.selectedTurma && this.selectedAnoTurma != undefined && this.selectedSemestreTurma != undefined && this.selectedTurma != undefined){
      this.mss = 'Aguarde seu arquivo está sendo baixado...';
      
      this.homService.gerarRelatorioHorarioTurma(this.selectedAnoTurma, this.selectedSemestreTurma, this.selectedTurma).subscribe({
        next: (data) => {
          this.mss = '';
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Relatório gerado com sucesso no diretório "Downloads"', life: 3000 },
          ];
        },
        error: (err) => {
          this.mss = '';
          if (err.status === 400) {
            this.messages = [
              { severity: 'error', summary: 'Erro', detail: err, life: 3000 },
            ];
          } else if(err.status === 200) {
            this.messages = [
              { severity: 'success', summary: 'Sucesso', detail: 'Relatório gerado com sucesso no diretório "Downloads"', life: 3000 },
            ];
          } else {
            this.messages = [
              { severity: 'error', summary: 'Erro inesperado', detail: 'Ocorreu um erro durante busca do relatório.\nPor favor, tente novamente.', life: 3000 },
            ];
          }
        }
      });
    } else if (this.selectedAnoTurma && this.selectedSemestreTurma && this.selectedAnoTurma != undefined && this.selectedSemestreTurma != undefined){
      this.mss = 'Aguarde seu arquivo está sendo baixado...';
      
      this.homService.gerarRelatorioHorarioTurma(this.selectedAnoTurma, this.selectedSemestreTurma, undefined).subscribe({
        next: (data) => {
          this.mss = '';
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Relatório gerado com sucesso no diretório "Downloads"', life: 3000 },
          ];
        },
        error: (err) => {
          this.mss = '';
          if (err.status === 400) {
            this.messages = [
              { severity: 'error', summary: 'Erro', detail: err, life: 3000 },
            ];
          } else if(err.status === 200) {
            this.messages = [
              { severity: 'success', summary: 'Sucesso', detail: 'Relatório gerado com sucesso no diretório "Downloads"', life: 3000 },
            ];
          } else {
            this.messages = [
              { severity: 'error', summary: 'Erro inesperado', detail: 'Ocorreu um erro durante busca do relatório.\nPor favor, tente novamente.', life: 3000 },
            ];
          }
        }
      });
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Selecione os campos!', life: 3000 },
      ];
    }
  }

  onSubmitProfessores(){
    if (this.selectedAnoProf && this.selectedSemestreProf && this.selectedProf && this.selectedCood && this.selectedAnoProf != undefined && this.selectedSemestreProf != undefined && this.selectedProf != undefined && this.selectedCood != undefined){
      this.mss = 'Aguarde seu arquivo está sendo baixado...';
      
      this.homService.gerarRelatorioHorarioPorProfessor(this.selectedAnoProf, this.selectedSemestreProf, this.selectedProf, this.selectedCood).subscribe({
        next: (data) => {
          this.mss = '';
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Relatório gerado com sucesso no diretório "Downloads"', life: 3000 },
          ];
        },
        error: (err) => {
          this.mss = '';
          if (err.status === 400) {
            this.messages = [
              { severity: 'error', summary: 'Erro', detail: err, life: 3000 },
            ];
          } else if(err.status === 200) {
            this.messages = [
              { severity: 'success', summary: 'Sucesso', detail: 'Relatório gerado com sucesso no diretório "Downloads"', life: 3000 },
            ];
          } else {
            this.messages = [
              { severity: 'error', summary: 'Erro inesperado', detail: 'Ocorreu um erro durante busca do relatório.\nPor favor, tente novamente.', life: 3000 },
            ];
          }
        }
      });
    } else if (this.selectedAnoProf && this.selectedSemestreProf && this.selectedCood && this.selectedAnoProf != undefined && this.selectedSemestreProf != undefined && this.selectedCood != undefined){
      this.mss = 'Aguarde seu arquivo está sendo baixado...';
      
      this.homService.gerarRelatorioHorarioPorProfessor(this.selectedAnoProf, this.selectedSemestreProf, this.selectedCood, undefined).subscribe({
        next: (data) => {
          this.mss = '';
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Relatório gerado com sucesso no diretório "Downloads"', life: 3000 },
          ];
        },
        error: (err) => {
          this.mss = '';
          if (err.status === 400) {
            this.messages = [
              { severity: 'error', summary: 'Erro', detail: err, life: 3000 },
            ];
          } else if(err.status === 200) {
            this.messages = [
              { severity: 'success', summary: 'Sucesso', detail: 'Relatório gerado com sucesso no diretório "Downloads"', life: 3000 },
            ];
          } else {
            this.messages = [
              { severity: 'error', summary: 'Erro inesperado', detail: 'Ocorreu um erro durante busca do relatório.\nPor favor, tente novamente.', life: 3000 },
            ];
          }
        }
      });
    } else if (this.selectedAnoProf && this.selectedSemestreProf && this.selectedAnoProf != undefined && this.selectedSemestreProf != undefined){
      this.mss = 'Aguarde seu arquivo está sendo baixado...';
      
      this.homService.gerarRelatorioHorarioPorProfessor(this.selectedAnoProf, this.selectedSemestreProf, undefined, undefined).subscribe({
        next: (data) => {
          this.mss = '';
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Relatório gerado com sucesso no diretório "Downloads"', life: 3000 },
          ];
        },
        error: (err) => {
          this.mss = '';
          if (err.status === 400) {
            this.messages = [
              { severity: 'error', summary: 'Erro', detail: err, life: 3000 },
            ];
          } else if(err.status === 200) {
            this.messages = [
              { severity: 'success', summary: 'Sucesso', detail: 'Relatório gerado com sucesso no diretório "Downloads"', life: 3000 },
            ];
          } else {
            this.messages = [
              { severity: 'error', summary: 'Erro inesperado', detail: 'Ocorreu um erro durante busca do relatório.\nPor favor, tente novamente.', life: 3000 },
            ];
          }
        }
      });
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Selecione os campos!', life: 3000 },
      ];
    }
  }

  mudarValorTurma() {
    if(this.selectedTurmaFilter.id == 0) {
      this.selectedTurma = undefined;
    }
  }

  mudarValorProfessor() {
    if(this.selectedProfFilter.id == 0) {
      this.selectedProfLabel = undefined;
      this.selectedProf = undefined;

      this.selectedCoodLabel = undefined;
      this.selectedCood = undefined;
    } else if(this.selectedProfFilter.id == 1) {
      this.selectedProfLabel = undefined;
      this.selectedProf = undefined;
    }
  }

  transformCoord() {
    if(this.selectedCoodLabel != undefined) {
      this.selectedCood = this.selectedCoodLabel.value;
    }
  }

  transformProf() {
    if(this.selectedProfLabel != undefined) {
      this.selectedProf = this.selectedProfLabel.value;
    }
  }
}