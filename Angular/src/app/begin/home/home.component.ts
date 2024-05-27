import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Time } from '@angular/common';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { Alocacao } from '../../models/alocacao.models';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DiaSemana, Horario, HorarioTable } from '../../models/horario.models';
import { HttpClientModule } from '@angular/common/http';
import { AlocacaoService } from '../../service/alocacao.service';
import { UserAuthService } from '../../_services/user-auth.service';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    PrimeNgImportsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    AlocacaoService,
    UserAuthService
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  messages!: Message[];
  
  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;
  
  unsubscribe$!: Subscription;
  alocacoesArray: Alocacao[] = [];

  alocacoesAgrupadas: Alocacao[][] = [];
  alocacoesAgrupadasSemFinalSemana: Alocacao[][] = [];
  semanaExibido: string = '';
  
  alocacaoMaisProxima!: Alocacao | undefined;
  
  diasDaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  diasDaSemanaSemFinal = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
  // diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  
  siglasAgrupadas: Alocacao[] = [];
  columnsHorario: HorarioTable[] = [
    {inicio: '07:00', fim: '07:50'},
    {inicio: '07:50', fim: '08:40'},
    {inicio: '08:40', fim: '09:30'},
    {inicio: '09:50', fim: '10:40'},
    {inicio: '10:40', fim: '11:30'},
    {inicio: '11:30', fim: '12:20'},
    {inicio: '13:00', fim: '13:50'},
    {inicio: '13:50', fim: '14:40'},
    {inicio: '14:40', fim: '15:30'},
    {inicio: '15:50', fim: '16:40'},
    {inicio: '16:40', fim: '17:30'},
    {inicio: '17:30', fim: '18:20'},
    {inicio: '18:50', fim: '19:35'},
    {inicio: '19:35', fim: '20:20'},
    {inicio: '20:30', fim: '21:15'},
    {inicio: '21:15', fim: '22:00'},
  ];

  mssVazio = ['Sem aulas agendadas para este período.', '', '', '', '', '', ''];
  
  constructor(
    private alocService: AlocacaoService,
    private userAuthService: UserAuthService
    ) {
  }

  ngOnInit() {
    this.filterOptions = [
      {nome: 'Aula mais próxima', id: 0},
      {nome: 'Horário do Período', id: 1}
    ];

    this.selectedFilter = this.filterOptions[0];
    this.unsubscribe$ = this.alocService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        
        data.sort((a: Alocacao, b: Alocacao) => {
          if ((a.dataAula === undefined || b.dataAula === undefined) || (a.dataAula === null || b.dataAula === null)) {
            return 0;
          }
          const dateA = new Date(a.dataAula);
          const dateB = new Date(b.dataAula);
          return dateB.getTime() - dateA.getTime();
        });
        this.alocacoesArray = data;

        const currentYear = new Date().getFullYear();
        this.alocacoesArray = this.alocacoesArray.filter((alocacao) => {
          const allocacaoDate = new Date(this.formatarDtStrDt(alocacao.dataAula));
          return allocacaoDate.getFullYear() === currentYear;
        });

        this.alocacoesArray = this.alocacoesArray.filter(alocacao => alocacao.status == 'ATIVO');

        this.filtrarAlocacoesPorDiaSemana();
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de alocações não encontrados.', life: 3000 },
        ];
      }
    });

  }
  
  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
  }

  qualPapel() {
    return this.userAuthService.getRole();
  }

  formatarTmStrTm(tempo: any) {
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

  formatarHora(tempo: any) {
    if (tempo) {
      const partes = tempo.split(':');
      const horas = partes[0];
      const minutos = partes[1];

      return `${horas}:${minutos}`;
    }
    return `00:00`;
  }

  formatMiliss(tempo: any) {
    if (tempo) {
      const partes = tempo.split(':');
      const horas = parseInt(partes[0], 10);
      const minutos = parseInt(partes[1], 10);
      const milissegundos = (horas * 60 + minutos) * 60000;
      return milissegundos;
    }
    return 0;
  }

  formatarDtStrDt(date: any) {
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

  obterAlocacaoMaisProxima(): void {
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
        const diaSemanaAlocacao = this.diasDaSemana[this.formatarDtStrDt(alocacao.dataAula).getDay()];
        let hIni = this.formatarTmStrTm(alocacao?.horario?.horaInicio)?.horas;
        let minIni = this.formatarTmStrTm(alocacao?.horario?.horaInicio)?.minutos;
        let hFim = this.formatarTmStrTm(alocacao?.horario?.horaFim)?.horas;
        let minFim = this.formatarTmStrTm(alocacao?.horario?.horaFim)?.minutos;
        
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
  
  filtrarAlocacoesPorDiaSemana() {
    const alocacaoUnique: Alocacao[][] = Array.from({ length: 7 }, () => []);
    const alocacaoUniqueSemFinalSemana: Alocacao[][] = Array.from({ length: 5 }, () => []);
  
    // const horariosUnicos: Horario[] = [];
    const siglasUnique: Alocacao[] = [];
  
    this.alocacoesArray.forEach((alocacao) => {
      const hoje = new Date();
      const periodo = alocacao.periodoDisciplina.periodo;
      if(periodo) {
        if(hoje.getTime() >= this.formatarDtStrDt(periodo.dataInicio).getTime() && hoje.getTime() <= this.formatarDtStrDt(periodo.dataFim).getTime()) {
          for (const aln of alocacao.periodoDisciplina.alunos) {
            // if(aln.matricula == '7891033533497') {
            if(aln.matricula == this.userAuthService.getLogin()) {
              const diaSemana = this.formatarDtStrDt(alocacao.dataAula).getDay();
              alocacaoUnique[diaSemana].push(alocacao);
              console.log(diaSemana)
              console.log(alocacaoUnique[diaSemana])
              
              if (diaSemana >= 1 && diaSemana <= 5) {
                alocacaoUniqueSemFinalSemana[diaSemana - 1].push(alocacao);
                console.log(alocacaoUniqueSemFinalSemana[diaSemana - 1])
              }
            }
          }
        }
      }
    });
    
    alocacaoUnique.forEach((diaAlocacoes, diaSemana) => {
      const alocacoesUnicas: Alocacao[] = [];
    
      diaAlocacoes.forEach((alocacaoAtual) => {
        const hIni = this.formatarTmStrTm(alocacaoAtual?.horario?.horaInicio)?.horas;
        const minIni = this.formatarTmStrTm(alocacaoAtual?.horario?.horaInicio)?.minutos;
        const hFim = this.formatarTmStrTm(alocacaoAtual?.horario?.horaFim)?.horas;
        const minFim = this.formatarTmStrTm(alocacaoAtual?.horario?.horaFim)?.minutos;

        const jaInserida = alocacoesUnicas.some((alocacao) =>
          alocacao.periodoDisciplina.disciplina.nome === alocacaoAtual.periodoDisciplina.disciplina.nome && this.formatarTmStrTm(alocacao.horario.horaInicio)?.horas === hIni && this.formatarTmStrTm(alocacao.horario.horaInicio)?.minutos === minIni && this.formatarTmStrTm(alocacao.horario.horaFim)?.horas === hFim && this.formatarTmStrTm(alocacao.horario.horaFim)?.minutos === minFim
        );
    
        if (!jaInserida) {
          alocacoesUnicas.push(alocacaoAtual);
          // const jaHora = horariosUnicos.some((hora) => this.formatarTmStrTm(hora.horaInicio)?.horas === hIni && this.formatarTmStrTm(hora.horaInicio)?.minutos === minIni && this.formatarTmStrTm(hora.horaFim)?.horas === hFim && this.formatarTmStrTm(hora.horaFim)?.minutos === minFim);
          
          // if(!jaHora) {
          //   horariosUnicos.push(alocacaoAtual.horario);
          // }
          // const jaSigla = siglasUnique.some((sgl) => sgl.periodoDisciplina.disciplina.nome == alocacaoAtual.periodoDisciplina.disciplina.nome && sgl.periodoDisciplina.disciplina.sigla == alocacaoAtual.periodoDisciplina.disciplina.sigla);
          
          // if(!jaSigla) {
          //   siglasUnique.push(alocacaoAtual);
          // }
        }
      });
    
      alocacaoUnique[diaSemana] = alocacoesUnicas;
    });

    alocacaoUniqueSemFinalSemana.forEach((diaAlocacoes, diaSemana) => {
      const alocacoesUnicasSemFinalSemana: Alocacao[] = [];
      
      diaAlocacoes.forEach((alocacaoAtual) => {
        const hIni = this.formatarTmStrTm(alocacaoAtual?.horario?.horaInicio)?.horas;
        const minIni = this.formatarTmStrTm(alocacaoAtual?.horario?.horaInicio)?.minutos;
        const hFim = this.formatarTmStrTm(alocacaoAtual?.horario?.horaFim)?.horas;
        const minFim = this.formatarTmStrTm(alocacaoAtual?.horario?.horaFim)?.minutos;
        
        const jaInseridaSemFinal = alocacoesUnicasSemFinalSemana.some((alocacao) =>
          alocacao.periodoDisciplina.disciplina.nome === alocacaoAtual.periodoDisciplina.disciplina.nome && this.formatarTmStrTm(alocacao.horario.horaInicio)?.horas === hIni && this.formatarTmStrTm(alocacao.horario.horaInicio)?.minutos === minIni && this.formatarTmStrTm(alocacao.horario.horaFim)?.horas === hFim && this.formatarTmStrTm(alocacao.horario.horaFim)?.minutos === minFim
        );
        
        if (!jaInseridaSemFinal) {
          alocacoesUnicasSemFinalSemana.push(alocacaoAtual);
          
          // const jaHora = horariosUnicos.some((hora) => this.formatarTmStrTm(hora.horaInicio)?.horas === hIni && this.formatarTmStrTm(hora.horaInicio)?.minutos === minIni && this.formatarTmStrTm(hora.horaFim)?.horas === hFim && this.formatarTmStrTm(hora.horaFim)?.minutos === minFim);
          
          // if(!jaHora) {
          //   horariosUnicos.push(alocacaoAtual.horario);
          // }
          const jaSigla = siglasUnique.some((sgl) => sgl.periodoDisciplina.disciplina.nome == alocacaoAtual.periodoDisciplina.disciplina.nome && sgl.periodoDisciplina.disciplina.sigla == alocacaoAtual.periodoDisciplina.disciplina.sigla);
          
          if(!jaSigla) {
            siglasUnique.push(alocacaoAtual);
          }
        }
      });
    
      alocacaoUniqueSemFinalSemana[diaSemana] = alocacoesUnicasSemFinalSemana;
    });
  
    this.alocacoesAgrupadas = alocacaoUnique;
    this.alocacoesAgrupadasSemFinalSemana = alocacaoUniqueSemFinalSemana;
    this.obterAlocacaoMaisProxima();
    // this.columnsHorario = horariosUnicos;
    this.siglasAgrupadas = siglasUnique;
    // this.columnsHorario.sort((a:Horario, b:Horario) => {
    //   let hAi = this.formatMiliss(a.horaInicio)
    //   let hBi = this.formatMiliss(b.horaInicio)
      
    //   if (hAi < hBi) {
    //     return -1;
    //   } else if (hAi > hBi) {
    //     return 1;
    //   } else {
    //     return 0;
    //   }
    // })
  }

  encontrarColunaCorrespondente(colHora: HorarioTable, grupo: Alocacao[]) {
    for (let alocacao of grupo) {
      const hIFormatado = this.formatarHora(alocacao.horario.horaInicio);
      const hFFormatado = this.formatarHora(alocacao.horario.horaFim);
      const colHi = this.formatarHora(colHora.inicio);
      const colHf = this.formatarHora(colHora.fim);
      
      if (colHi === hIFormatado && colHf === hFFormatado) {
        return alocacao;
      }
    }
    return null;
  }

  percorrerGrupoArray() {
    let alocV!: Alocacao;
    for (const grp of this.alocacoesAgrupadasSemFinalSemana) {
      for (const aloc of grp) {
        if(aloc != null || aloc != undefined) alocV = aloc;
      }
    }
    if(alocV == null || alocV == undefined){ return true }
    else{ return false }
  }
}
