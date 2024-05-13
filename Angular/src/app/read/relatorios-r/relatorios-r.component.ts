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
      provideNgxMask()
    ]
  })

export class RelatoriosRComponent implements OnInit{
    
    anorelatorioArray: number[] = [];
    semestrerelatorioArray: number[] = [];

    selectedAno!: number
    selectedSemestre!: number

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

    onSubmit(){
        
      if (this.selectedAno && this.selectedSemestre){
        
      }

    }

    }