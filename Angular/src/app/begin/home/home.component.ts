import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Time } from '@angular/common';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { Alocacao } from '../../models/alocacao.models';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DiaSemana, Horario } from '../../models/horario.models';
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
    CommonModule,
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

  alocacoesUser: Alocacao[] = [];
  alocacoesAgrupadas: Alocacao[][] = [];
  semanaExibido: string = '';
  
  alocacaoMaisProxima!: Alocacao | undefined;
  
  diasDaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  // diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  
  siglasAgrupadas: Alocacao[] = [];
  columnsHorario: Horario[] = [];

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
  
    this.alocacoesArray.forEach((alocacao) => {
      const hoje = new Date();
      const periodo = alocacao.periodoDisciplina.periodo;
      if(periodo) {
        if(hoje.getTime() >= this.formatarDtStrDt(periodo.dataInicio).getTime() && hoje.getTime() <= this.formatarDtStrDt(periodo.dataFim).getTime()) {
          for (const aln of alocacao.periodoDisciplina.alunos) {
            if(aln.matricula == this.userAuthService.getLogin()) {
              const diaSemana = this.formatarDtStrDt(alocacao.dataAula).getDay();
              alocacaoUnique[diaSemana].push(alocacao);
            }
          }
        }
      }
    });
  
    const horariosUnicos: Horario[] = [];
    const siglasUnique: Alocacao[] = [];
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
          const jaHora = horariosUnicos.some((hora) => this.formatarTmStrTm(hora.horaInicio)?.horas === hIni && this.formatarTmStrTm(hora.horaInicio)?.minutos === minIni && this.formatarTmStrTm(hora.horaFim)?.horas === hFim && this.formatarTmStrTm(hora.horaFim)?.minutos === minFim);
          
          if(!jaHora) {
            horariosUnicos.push(alocacaoAtual.horario);
          }
          const jaSigla = siglasUnique.some((sgl) => sgl.periodoDisciplina.disciplina.nome == alocacaoAtual.periodoDisciplina.disciplina.nome && sgl.periodoDisciplina.disciplina.sigla == alocacaoAtual.periodoDisciplina.disciplina.sigla);
          
          if(!jaSigla) {
            siglasUnique.push(alocacaoAtual);
          }
        }
      });
    
      alocacaoUnique[diaSemana] = alocacoesUnicas;
    });
  
    this.alocacoesAgrupadas = alocacaoUnique;
    this.obterAlocacaoMaisProxima();
    this.columnsHorario = horariosUnicos;
    this.siglasAgrupadas = siglasUnique;
    this.columnsHorario.sort((a:Horario, b:Horario) => {
      let hAi = this.formatMiliss(a.horaInicio)
      let hBi = this.formatMiliss(b.horaInicio)
      
      if (hAi < hBi) {
        return -1;
      } else if (hAi > hBi) {
        return 1;
      } else {
        return 0;
      }
    })
  }

  encontrarColunaCorrespondente(colHora: Horario | undefined, alocacao: Alocacao) {
    const hIFormatado = this.formatarTmStrTm(alocacao?.horario?.horaInicio);
    const hFFormatado = this.formatarTmStrTm(alocacao?.horario?.horaFim);
    const colHi = this.formatarTmStrTm(colHora?.horaInicio);
    const colHf = this.formatarTmStrTm(colHora?.horaFim);

    if(colHi?.horas === hIFormatado?.horas && colHi?.minutos === hIFormatado?.minutos && hFFormatado?.horas === colHf?.horas && colHf?.minutos === hFFormatado?.minutos){ return alocacao }
    else{ return null }
  }

  percorrerGrupoArray() {
    let alocV!: Alocacao;
    for (const grp of this.alocacoesAgrupadas) {
      for (const aloc of grp) {
        if(aloc != null || aloc != undefined) alocV = aloc;
      }
    }
    if(alocV == null || alocV == undefined){ return true }
    else{ return false }
  }
}
