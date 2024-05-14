import { Component, OnDestroy, OnInit } from '@angular/core';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CommonModule, Time } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { Alocacao } from '../../models/alocacao.models';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DiaSemana, Horario } from '../../models/horario.models';
import { HttpClientModule } from '@angular/common/http';
import { AlocacaoService } from '../../service/alocacao.service';
import { UserAuthService } from '../../_services/user-auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RadioButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CommonModule,
    PaginatorModule,
    HttpClientModule,
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
  // horarioIndividualData: any[] = [];
  messages!: Message[];
  
  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;

  alocacoesArray: Alocacao[] = [];
  alocacoesUser: Alocacao[] = [];
  alocacoesAgrupadas: Alocacao[][] = [];
  alocaoMaisProxima!: Alocacao;
  diaSemanaExibido: string = '';
  
  unsubscribe$!: Subscription;
  
  diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  siglasAgrupadas: Alocacao[] = [];

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
        // this.alocacoesArray = this.alocacoesArray.filter((alocacao) => {
        //   const allocacaoDate = new Date(this.formatarDtStrDt(alocacao.dataAula));
        //   return allocacaoDate.getFullYear() === currentYear;
        // });

        for (const alocA of this.alocacoesArray) {
          // for (const aln of alocA.periodoDisciplina.alunos) {
          //   if(aln.matricula == this.userAuthService.getLogin()) {
              const weekArr = this.diasDaSemana[new Date(alocA.dataAula).getDay()];
              // const weekUse = this.diasDaSemana[new Date(alocU.dataAula).getDay()];
                if(!this.alocacoesUser.some(alocU => alocU.periodoDisciplina === alocA.periodoDisciplina) && !this.alocacoesUser.some(alocU => this.diasDaSemana[new Date(alocU.dataAula).getDay()] === weekArr) && !this.alocacoesUser.some((alocU) => {
                  alocU.horario.horaInicio.hours == alocA.horario.horaInicio.hours && alocU.horario.horaInicio.minutes == alocA.horario.horaInicio.minutes
                }) && weekArr != 'Domingo') this.alocacoesUser.push(alocA);
          //   }
          // }
        }
        this.alocacoesUser.sort((a:Alocacao, b:Alocacao) => {
          if (a.horario.horaInicio.hours < b.horario.horaInicio.hours) {
            return -1;
          } else if (a.horario.horaInicio.hours > b.horario.horaInicio.hours) {
            return 1;
          } else {
            if (a.horario.horaInicio.minutes < b.horario.horaInicio.minutes) {
              return -1;
            } else if (a.horario.horaInicio.minutes > b.horario.horaInicio.minutes) {
              return 1;
            } else {
              return 0;
            }
          }
        })
        this.obterContentProx();
        this.agruparPorHorario(this.alocacoesUser);
        this.exibirSiglas();
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

  obterContentProx() {
    const horaAtual = new Date().getTime();
    const diaSemanaAtualTexto = this.diasDaSemana[new Date().getDay()];
  
    let diffMaisProxima = Infinity;
    let alocaoProxima: Alocacao | undefined;
  
    this.alocacoesUser.forEach(aloca => {
      const horario: Horario = aloca.horario;
      const milissegundosAloca = this.formatMiliss(horario.horaInicio);
  
      const diff = Math.abs(horaAtual - milissegundosAloca);
  
      let dataAlocU = this.formatarDtStrDt(aloca.dataAula)
      const diaSemanaAlocaTexto = this.diasDaSemana[new Date(dataAlocU).getDay()];
  
      if(diaSemanaAtualTexto !== 'Domingo' && diaSemanaAlocaTexto !== 'Domingo') {
        if (diff < diffMaisProxima && diaSemanaAlocaTexto === diaSemanaAtualTexto) {
          alocaoProxima = aloca;
          diffMaisProxima = diff;
        }
      }
    });
  
    if (alocaoProxima) {
      this.alocaoMaisProxima = alocaoProxima;
      this.diaSemanaExibido = diaSemanaAtualTexto;
    }
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
    const partes = tempo.split(':');
    const horas = partes[0];
    const minutos = partes[1];

    return `${horas}:${minutos}`;
  }

  formatMiliss(tempo: any) {
    if (tempo) {
      const partes = tempo.split(':');
      const horas = parseInt(partes[0], 10);
      const minutos = parseInt(partes[1], 10) - 1;
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

      return new Date(dia, mes, ano);
    } else {
      return new Date();
    }
  }

  agruparPorHorario(alocacoes: Alocacao[]) {
    alocacoes.forEach((alocacao) => {
      // const timeKey = `${alocacao.horario.horaInicio.hours}:${alocacao.horario.horaInicio.minutes}`;
      
      let agrupamento = this.alocacoesAgrupadas.find((grupo) => grupo[0].horario.horaInicio.hours === alocacao.horario.horaInicio.hours && grupo[0].horario.horaInicio.minutes === alocacao.horario.horaInicio.minutes);
  
      if (!agrupamento) {
        agrupamento = [alocacao];
        this.alocacoesAgrupadas.push(agrupamento);
      } else {
        agrupamento.push(alocacao);
      }
    });
  }

  exibirAlocacao(alocacao: Alocacao, diaSemana: string): boolean {
    let diaAula = this.formatarDtStrDt(alocacao.dataAula)
    const diaSemanaAloc = this.diasDaSemana[new Date(diaAula).getDay()];
    if (diaSemanaAloc == diaSemana) {
      return true;
    }
    return false;
  }

  exibirSiglas() {
    for (const itt of this.alocacoesAgrupadas) {
      for (const tor of itt) {
        if(this.siglasAgrupadas.length > 0) {
          for (const sga of this.siglasAgrupadas) {
            if(sga.periodoDisciplina.disciplina.sigla != tor.periodoDisciplina.disciplina.sigla) {
              this.siglasAgrupadas.push(tor);
            }
          }
        } else if(this.siglasAgrupadas.length <= 0) this.siglasAgrupadas.push(tor);
      }
    }
  }

}
