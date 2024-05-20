import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Message, MessageService } from 'primeng/api';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { UserAuthService } from '../../_services/user-auth.service';
import { AlocacaoService } from '../../service/alocacao.service';
import { Subscription } from 'rxjs';
import { Alocacao } from '../../models/alocacao.models';
import { Aluno } from '../../models/aluno.models';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { Horario } from '../../models/horario.models';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-scanner-popup',
  standalone: true,
  imports: [
    PrimeNgImportsModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  templateUrl: './scanner-popup.component.html',
  styleUrl: './scanner-popup.component.scss',
  providers: [
    MessageService,
    UserAuthService,
    AlocacaoService
  ]
})
export class ScannerPopupComponent implements OnInit, AfterViewInit {
  // @ViewChild('scannerInput') scannerInput!: InputText;
  @ViewChild('scannerInput') scannerInput!: ElementRef;
  
  messages!: Message[];
  barcode: string = '';
  previousBarcode: string = '';
  
  unsubscribe$!: Subscription;
  alocacoesArray: Alocacao[] = [];
  
  alunoComHorario!: Aluno;
  
  visible: boolean = false;
  mssMatriculaVazia: string = '';
  
  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;
  
  alocacoesAgrupadas: Alocacao[][] = [];
  alocacoesAgrupadasSemFinalSemana: Alocacao[][] = [];
  semanaExibido: string = '';
  
  alocacaoMaisProxima!: Alocacao | undefined;
  
  diasDaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  diasDaSemanaSemFinal = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
  
  siglasAgrupadas: Alocacao[] = [];
  columnsHorario: Horario[] = [];

  mssVazio = ['Sem aulas agendadas para este período.', '', '', '', '', '', ''];

  constructor(
    private router: Router,
    private userAuthService: UserAuthService,
    private alocService: AlocacaoService
  ) {
    this.filterOptions = [
      {nome: 'Aula mais próxima', id: 0},
      {nome: 'Horário do Período', id: 1}
    ];
    this.selectedFilter = this.filterOptions[0];
  }

  ngOnInit(): void {
    this.scannerInput.nativeElement.focus();
  }

  ngAfterViewInit(): void {
    const scannerInput = document.getElementById('scannerInput');
    const otherInputs = document.querySelectorAll('input:not(#scannerInput)');
    const otherInputsArray = Array.from(otherInputs);

    document.addEventListener('click', (event:any) => {
      const isPrimeNGInput = event.target.classList.contains('p-inputtext') || event.target.classList.contains('p-inputnumber');
      // console.log('is ',isPrimeNGInput)

      if ( (scannerInput?.contains(event.target) || !scannerInput?.contains(event.target)) && !otherInputsArray.some((input:any) => input.contains(event.target)) && !isPrimeNGInput ) {
        // console.log('voltou fc')
        // this.scannerInput.nativeElement.addEventListener('blur', () => {
          this.scannerInput.nativeElement.focus();
        // });
      } else if( (scannerInput?.contains(event.target) || !scannerInput?.contains(event.target)) && (otherInputsArray.some((input:any) => input.contains(event.target)) || isPrimeNGInput) ) {
        // console.log('saiu fc')
        this.scannerInput.nativeElement.blur();
      }
    });
  }
  
  isLoggedScan() {
    return this.userAuthService.isLoggedIn();
  }
  
  onKey() {
    const url = this.router.url;
    const role = this.userAuthService.getRole();
    const login = this.userAuthService.getLogin();

    if ((this.isLoggedScan() && !url.includes('login') && !url.includes('forbidden')) || (this.isLoggedScan() && url.includes('relatorios'))) {
    // if ((!url.includes('login') && !url.includes('forbidden')) || (url.includes('relatorios'))) {
      if(role === "ADMIN" || login === this.previousBarcode) {
        setTimeout(() => {
          this.previousBarcode = this.barcode;
          this.barcode = ''

          // this.filterOptions = [
          //   {nome: 'Aula mais próxima', id: 0},
          //   {nome: 'Horário do Período', id: 1}
          // ];
          // this.selectedFilter = this.filterOptions[0];
          this.mssMatriculaVazia = ''
          this.carregarUsersScan()
        }, 500);
      } else if(login != this.previousBarcode) {
        this.visible = true
        this.mssMatriculaVazia = 'Favor fazer o login.'
      }
    } else {
      this.barcode = '';
    }
  }

  mostrarHorarioUserScan() {
    for (const aloc of this.alocacoesArray) {
      for (const aln of aloc.periodoDisciplina.alunos) {
        // console.log('aln ',aln.matricula, 'prev ', this.previousBarcode)
        if(aln.matricula === this.previousBarcode) this.alunoComHorario = aln;
      }
    }

    if(this.alunoComHorario != null && this.alunoComHorario != undefined) {
      this.filtrarAlocacoesPorDiaSemanaScan();
      this.mssMatriculaVazia = ''
      this.visible = true
    } else {
      this.visible = true
      this.mssMatriculaVazia = 'não há horário para esta matrícula'
    }
  }

  carregarUsersScan() {
    this.alocService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.alocacoesArray = data;

        this.alocacoesArray = this.alocacoesArray.filter((alocacao) => {
          const hoje = new Date();
          const periodo = alocacao.periodoDisciplina.periodo;
          if(periodo) {
            if(hoje.getTime() >= this.formatarDtStrDtScan(periodo.dataInicio).getTime() && hoje.getTime() <= this.formatarDtStrDtScan(periodo.dataFim).getTime()) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        })

        this.alocacoesArray = this.alocacoesArray.filter(alocacao => alocacao.status === 'ATIVO');

        this.mostrarHorarioUserScan()
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de alocações não encontrados.', life: 3000 },
        ];
      }
    });
  }
  
  formatarTmStrTmScan(tempo: any) {
    if (tempo) {
      const partes = tempo.split(':');
      const horas = parseInt(partes[0], 10);
      const minutos = parseInt(partes[1], 10);

      if (!isNaN(horas) && !isNaN(minutos) && horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59) {
        return { horas, minutos };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  formatarHoraScan(tempo: any) {
    if (tempo) {
      const partes = tempo.split(':');
      const horas = partes[0];
      const minutos = partes[1];

      return `${horas}:${minutos}`;
    }
    return `00:00`;
  }

  formatMilissScan(tempo: any) {
    if (tempo) {
      const partes = tempo.split(':');
      const horas = parseInt(partes[0], 10);
      const minutos = parseInt(partes[1], 10);
      const milissegundos = (horas * 60 + minutos) * 60000;
      return milissegundos;
    }
    return 0;
  }

  formatarDtStrDtScan(date: any) {
    if(date) {
      const partes = date.split('-');
      const ano = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const dia = parseInt(partes[2], 10);

      return new Date(ano, mes, dia);
    } else {
      return new Date();
    }
  }

  obterAlocacaoMaisProximaScan(): void {
    const hoje = new Date();
    const diaSemanaHoje = this.diasDaSemana[hoje.getDay()];
    const indiceDiaAtual = hoje.getDay();
    const horaAtual = new Date().getHours() * 60 + new Date().getMinutes();

    if (this.alocacoesAgrupadas[indiceDiaAtual].length === 0) {
      this.alocacaoMaisProxima = undefined;
      return;
    }
    
    this.alocacoesAgrupadas[indiceDiaAtual]
      .find((alocacao) => {
        const diaSemanaAlocacao = this.diasDaSemana[this.formatarDtStrDtScan(alocacao.dataAula).getDay()];
        let hIni = this.formatarTmStrTmScan(alocacao?.horario?.horaInicio)?.horas;
        let minIni = this.formatarTmStrTmScan(alocacao?.horario?.horaInicio)?.minutos;
        let hFim = this.formatarTmStrTmScan(alocacao?.horario?.horaFim)?.horas;
        let minFim = this.formatarTmStrTmScan(alocacao?.horario?.horaFim)?.minutos;
        
        if(hIni != undefined && minIni != undefined && hFim != undefined && minFim != undefined) {
          const horaInicioEmMinutos = hIni * 60 + minIni;
          const horaFimEmMinutos = hFim * 60 + minFim;
          
          const proximidade = 30; //  Isso permite que a hora atual seja até ... minutos antes do horário de início da alocação.

          if (
            diaSemanaAlocacao === diaSemanaHoje &&
            horaAtual >= (horaInicioEmMinutos - proximidade) &&
            horaAtual <= horaFimEmMinutos
          ) this.alocacaoMaisProxima = alocacao;
        } else this.alocacaoMaisProxima = undefined;
      });

    if(this.alocacaoMaisProxima) this.semanaExibido = diaSemanaHoje;
  }
  
  filtrarAlocacoesPorDiaSemanaScan() {
    const alocacaoUnique: Alocacao[][] = Array.from({ length: 7 }, () => []);
    const alocacaoUniqueSemFinalSemana: Alocacao[][] = Array.from({ length: 5 }, () => []);
  
    const horariosUnicos: Horario[] = [];
    const siglasUnique: Alocacao[] = [];
  
    this.alocacoesArray.forEach((alocacao) => {
      const hoje = new Date();
      const periodo = alocacao.periodoDisciplina.periodo;
      if(periodo) {
        if(hoje.getTime() >= this.formatarDtStrDtScan(periodo.dataInicio).getTime() && hoje.getTime() <= this.formatarDtStrDtScan(periodo.dataFim).getTime()) {
          const studentFound = alocacao.periodoDisciplina.alunos.some(
            (aln) => aln.matricula === this.previousBarcode
          );
    
          if (studentFound) {
            const diaSemana = this.formatarDtStrDtScan(alocacao.dataAula).getDay();
            alocacaoUnique[diaSemana].push(alocacao);
    
            if (diaSemana >= 1 && diaSemana <= 5) {
              alocacaoUniqueSemFinalSemana[diaSemana - 1].push(alocacao);
            }
          }
        }
      }
    });
    
    alocacaoUnique.forEach((diaAlocacoes, diaSemana) => {
      const alocacoesUnicas: Alocacao[] = [];
    
      diaAlocacoes.forEach((alocacaoAtual) => {
        const hIni = this.formatarTmStrTmScan(alocacaoAtual?.horario?.horaInicio)?.horas;
        const minIni = this.formatarTmStrTmScan(alocacaoAtual?.horario?.horaInicio)?.minutos;
        const hFim = this.formatarTmStrTmScan(alocacaoAtual?.horario?.horaFim)?.horas;
        const minFim = this.formatarTmStrTmScan(alocacaoAtual?.horario?.horaFim)?.minutos;

        const jaInserida = alocacoesUnicas.some((alocacao) =>
          alocacao.periodoDisciplina.disciplina.nome === alocacaoAtual.periodoDisciplina.disciplina.nome && this.formatarTmStrTmScan(alocacao.horario.horaInicio)?.horas === hIni && this.formatarTmStrTmScan(alocacao.horario.horaInicio)?.minutos === minIni && this.formatarTmStrTmScan(alocacao.horario.horaFim)?.horas === hFim && this.formatarTmStrTmScan(alocacao.horario.horaFim)?.minutos === minFim
        );
    
        if (!jaInserida) {
          alocacoesUnicas.push(alocacaoAtual);
        }
      });
    
      alocacaoUnique[diaSemana] = alocacoesUnicas;
    });

    alocacaoUniqueSemFinalSemana.forEach((diaAlocacoes, diaSemana) => {
      const alocacoesUnicasSemFinalSemana: Alocacao[] = [];
      
      diaAlocacoes.forEach((alocacaoAtual) => {
        const hIni = this.formatMilissScan(alocacaoAtual.horario.horaInicio);
        const hFim = this.formatMilissScan(alocacaoAtual.horario.horaFim);
        const diaAlocSemana = this.diasDaSemanaSemFinal[this.formatarDtStrDtScan(alocacaoAtual.dataAula).getDay()];
        
        const jaInseridaSemFinal = alocacoesUnicasSemFinalSemana.some((alocacao) =>
          alocacao.periodoDisciplina.disciplina.nome === alocacaoAtual.periodoDisciplina.disciplina.nome && this.formatMilissScan(alocacao.horario.horaInicio) === hIni && this.formatMilissScan(alocacao.horario.horaInicio) === hIni && this.formatMilissScan(alocacao.horario.horaFim) === hFim && this.formatMilissScan(alocacao.horario.horaFim) === hFim && diaAlocSemana === this.diasDaSemanaSemFinal[this.formatarDtStrDtScan(alocacao.dataAula).getDay()]
        );
        
        if (!jaInseridaSemFinal) {
          alocacoesUnicasSemFinalSemana.push(alocacaoAtual);
          
          const jaHora = horariosUnicos.some((hora) => this.formatMilissScan(hora.horaInicio) === hIni && this.formatMilissScan(hora.horaInicio) === hIni && this.formatMilissScan(hora.horaFim) === hFim && this.formatMilissScan(hora.horaFim) === hFim);
          
          if(!jaHora) {
            horariosUnicos.push(alocacaoAtual.horario);
          }
          const jaSigla = siglasUnique.some((sgl) => sgl.periodoDisciplina.disciplina.nome === alocacaoAtual.periodoDisciplina.disciplina.nome && sgl.periodoDisciplina.disciplina.sigla === alocacaoAtual.periodoDisciplina.disciplina.sigla);
          
          if(!jaSigla) {
            siglasUnique.push(alocacaoAtual);
          }
        }
      });
    
      alocacaoUniqueSemFinalSemana[diaSemana] = alocacoesUnicasSemFinalSemana;
      console.log(alocacaoUniqueSemFinalSemana[diaSemana])
    });
  
    this.alocacoesAgrupadas = alocacaoUnique;
    this.alocacoesAgrupadasSemFinalSemana = alocacaoUniqueSemFinalSemana;
    this.alocacoesAgrupadasSemFinalSemana.forEach((arrayAloc) => {
      arrayAloc.sort((a:Alocacao, b:Alocacao) => {
        let hAi = this.formatMilissScan(a.horario.horaInicio)
        let hBi = this.formatMilissScan(b.horario.horaInicio)
        
        if (hAi < hBi) {
          return -1;
        } else if (hAi > hBi) {
          return 1;
        } else {
          return 0;
        }
      })
    })
    this.obterAlocacaoMaisProximaScan();
    this.columnsHorario = horariosUnicos;
    this.siglasAgrupadas = siglasUnique;
    this.columnsHorario.sort((a:Horario, b:Horario) => {
      let hAi = this.formatMilissScan(a.horaInicio)
      let hBi = this.formatMilissScan(b.horaInicio)
      
      if (hAi < hBi) {
        return -1;
      } else if (hAi > hBi) {
        return 1;
      } else {
        return 0;
      }
    })
  }

  encontrarColunaCorrespondenteScan(colHora: Horario, grupo: Alocacao[]) {
    for (let alocacao of grupo) {
      const hIFormatado = this.formatarHoraScan(alocacao.horario.horaInicio);
      const hFFormatado = this.formatarHoraScan(alocacao.horario.horaFim);
      const colHi = this.formatarHoraScan(colHora.horaInicio);
      const colHf = this.formatarHoraScan(colHora.horaFim);
      
      if (colHi === hIFormatado && colHf === hFFormatado) {
        return alocacao;
      }
    }
    return null;
  }

  percorrerGrupoArrayScan() {
    let alocV!: Alocacao;
    for (const grp of this.alocacoesAgrupadasSemFinalSemana) {
      for (const aloc of grp) {
        if(aloc != null || aloc != undefined) alocV = aloc;
      }
    }
    if(alocV === null || alocV === undefined){ return true }
    else{ return false }
  }
}