import { Component, OnDestroy, OnInit } from '@angular/core';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CommonModule, Time } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { Alocacao } from '../../models/alocacao.models';
import { AlocacaoService } from '../../service/alocacao.service';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DiaSemana, Horario } from '../../models/horario.models';
import { HttpClientModule } from '@angular/common/http';

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
    AlocacaoService,
    ConfirmationService,
    MessageService,
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  // horarioIndividualData: any[] = [];
  messages!: Message[];
  form: FormGroup;
  
  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;

  alocacoesArray: Alocacao[] = [];
  alocaoMaisProxima!: Alocacao;
  diaSemanaExibido: string = '';

  unsubscribe$!: Subscription;

  diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  constructor(
    private formBuilder: FormBuilder,
    private alocService: AlocacaoService,
    ) {
      this.form = this.formBuilder.group({
        user: [null],
        senha: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]]
      });
  }

  ngOnInit() {

    this.filterOptions = [
      {nome: 'Aula mais próxima', id: 0},
      {nome: 'Horário do Período', id: 1}
    ];
    
    this.selectedFilter = this.filterOptions[0];

    this.alocacoesArray = [
      // {
      //   id: 1,
      //   numAulas: 30,
      //   horario: {
      //     id: 0,
      //     diaSemana: DiaSemana.TERCA,
      //     horaFim: {hours: 12, minutes:2},
      //     horaInicio: {hours: 10, minutes:2}
      //   },
      //   turma: "V01",
      //   diaSemana: "Segunda-feira",
      //   dataAula: new Date(2024, 4, 16),
      //   local: {
      //     id: 1,
      //     nome: "Local 1",
      //     capacidade: 41,
      //     localEquipamentos: [
      //       {
      //         id: 1,
      //         equipamento: {
      //           id: 1,
      //           nome: "Projetor"
      //         },
      //         local: null,
      //         quantidade: 45
      //       }
      //     ]
      //   },
      //   disciplina: {
      //     id: 1,
      //     nome: "Modelagem de Processos de Negócio"
      //   },
      //   periodo: {
      //     id: 2,
      //     dataInicio: new Date("2024-04-01"),
      //     dataFim: new Date("2024-04-30"),
      //     descricao: "lkjhk\n"
      //   },
      //   professor: {
      //     id: 2,
      //     nome: "Lays",
      //     matricula: '54654654',
      //     curso: "Sistemas",
      //     ehCoordenador: false
      //   },
      //   alunos: [
      //     {
      //       id: 1,
      //       nome: "Aluno",
      //       matricula: "matricula",
      //       curso: "curso"
      //     }
      //   ]
      // },
      // {
      //   id: 2,
      //   numAulas: 30,
      //   horario: {
      //     id: 0,
      //     diaSemana: DiaSemana.SEGUNDA,
      //     horaFim: {hours: 15, minutes:2},
      //     horaInicio: {hours: 13, minutes:2}
      //   },
      //   turma: "V01",
      //   diaSemana: "Segunda-feira",
      //   dataAula: new Date(2024,4,15),
      //   local: {
      //     id: 1,
      //     nome: "Local 1",
      //     capacidade: 41,
      //     localEquipamentos: [
      //       {
      //         id: 1,
      //         equipamento: {
      //           id: 1,
      //           nome: "Projetor"
      //         },
      //         local: null,
      //         quantidade: 45
      //       }
      //     ]
      //   },
      //   disciplina: {
      //     id: 2,
      //     nome: "Tópicos Especiais em Redes de Computadores"
      //   },
      //   periodo: {
      //     id: 2,
      //     dataInicio: new Date("2024-04-01"),
      //     dataFim: new Date("2024-04-30"),
      //     descricao: "lkjhk\n"
      //   },
      //   professor: {
      //     id: 2,
      //     nome: "Lays",
      //     matricula: '54654654',
      //     curso: "Sistemas",
      //     ehCoordenador: false
      //   },
      //   alunos: [
      //     {
      //       id: 1,
      //       nome: "Aluno",
      //       matricula: "matricula",
      //       curso: "curso"
      //     }
      //   ]
      // },
      // {
      //   id: 3,
      //   numAulas: 30,
      //   horario: {
      //     id: 0,
      //     diaSemana: DiaSemana.QUINTA,
      //     horaFim: {hours: 20, minutes:20},
      //     horaInicio: {hours: 22, minutes:0}
      //   },
      //   turma: "V01",
      //   diaSemana: "Segunda-feira",
      //   dataAula: new Date(2024, 4, 18),
      //   local: {
      //     id: 1,
      //     nome: "Local 1",
      //     capacidade: 41,
      //     localEquipamentos: [
      //       {
      //         id: 1,
      //         equipamento: {
      //           id: 1,
      //           nome: "Projetor"
      //         },
      //         local: null,
      //         quantidade: 45
      //       }
      //     ]
      //   },
      //   disciplina: {
      //     id: 3,
      //     nome: "Gerência de Projetos de Software"
      //   },
      //   periodo: {
      //     id: 2,
      //     dataInicio: new Date("2024-04-01"),
      //     dataFim: new Date("2024-04-30"),
      //     descricao: "lkjhk\n"
      //   },
      //   professor: {
      //     id: 2,
      //     nome: "Lays",
      //     matricula: '54654654',
      //     curso: "Sistemas",
      //     ehCoordenador: false
      //   },
      //   alunos: [
      //     {
      //       id: 1,
      //       nome: "Aluno",
      //       matricula: "matricula",
      //       curso: "curso"
      //     }
      //   ]
      // },
      // {
      //   id: 4,
      //   numAulas: 30,
      //   horario: {
      //     id: 0,
      //     diaSemana: DiaSemana.SEXTA,
      //     horaFim: {hours: 18, minutes:2},
      //     horaInicio: {hours: 19, minutes:2}
      //   },
      //   turma: "V01",
      //   diaSemana: "Segunda-feira",
      //   dataAula: new Date(2024, 4, 26),
      //   local: {
      //     id: 1,
      //     nome: "Local 1",
      //     capacidade: 41,
      //     localEquipamentos: [
      //       {
      //         id: 1,
      //         equipamento: {
      //           id: 1,
      //           nome: "Projetor"
      //         },
      //         local: null,
      //         quantidade: 45
      //       }
      //     ]
      //   },
      //   disciplina: {
      //     id: 4,
      //     nome: "Interface com Usuário"
      //   },
      //   periodo: {
      //     id: 2,
      //     dataInicio: new Date("2024-04-01"),
      //     dataFim: new Date("2024-04-30"),
      //     descricao: "lkjhk\n"
      //   },
      //   professor: {
      //     id: 2,
      //     nome: "Lays",
      //     matricula: '54654654',
      //     curso: "Sistemas",
      //     ehCoordenador: false
      //   },
      //   alunos: [
      //     {
      //       id: 1,
      //       nome: "Aluno",
      //       matricula: "matricula",
      //       curso: "curso"
      //     }
      //   ]
      // },
    ]
    
    this.unsubscribe$ = this.alocService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        
        data.sort((a: Alocacao, b: Alocacao) => {
          const dateA = new Date(a.dataAula);
          const dateB = new Date(b.dataAula);
          return dateB.getTime() - dateA.getTime();
        });
        
        // this.alocacoesArray = data;
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de alocações não encontrados.', life: 3000 },
        ];
      }
    });
    this.obterContentProx();
  }
  
  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
  }

  obterContentProx() {
    // const horaAtual = new Date().getTime();
    // const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    // const diaSemanaAtualTexto = diasDaSemana[new Date().getDay()];
  
    // let diffMaisProxima = Infinity;
    // let alocaoMaisProxima: Alocacao | undefined;
  
    // this.alocacoesArray.forEach(aloca => {
    //   const horario: Horario = aloca.horario;
    //   const milissegundosAloca = this.formatMiliss(horario.horaInicio);
  
    //   const diff = Math.abs(horaAtual - milissegundosAloca);
  
    //   const diaSemanaAlocaTexto = this.getDiaSemanaFormatado(new Date(aloca.dataAula).getDay());
  
    //   console.log('alc 1 ',aloca)
    //   console.log('1 ',diaSemanaAlocaTexto)
    //   console.log('2 ',diaSemanaAtualTexto)
    //   console.log('dif 1 ',diaSemanaAlocaTexto === diaSemanaAtualTexto)
    //   console.log('dif 2 ',diff < diffMaisProxima)
    //   if (diff < diffMaisProxima && diaSemanaAlocaTexto === diaSemanaAtualTexto) {
    //     alocaoMaisProxima = aloca;
    //     diffMaisProxima = diff;
    //   }
    // });
  
    // if (alocaoMaisProxima) {
    //   this.alocaoMaisProxima = alocaoMaisProxima;
    //   this.diaSemanaExibido = diaSemanaAtualTexto;
    // }
    // console.log('aloc 2 ',alocaoMaisProxima)
  }
  
  formatarHora(tempo: Time) {
    if (tempo) {
    // if (typeof tempo === 'string') {
      // const partes = tempo.split(':');
      const horas = tempo.hours.toString().padStart(2, '0');
      const minutos = tempo.minutes.toString().padStart(2, '0');

      return `${horas}h ${minutos}min`;
    }
    return null;
  }

  formatMiliss(tempo: any) {
    if (tempo) {
      // const partes = tempo.split(':');
      const horas = parseInt(tempo.hours.toString(), 10);
      const minutos = parseInt(tempo.minutes.toString(), 10);
      const milissegundos = (horas * 60 + minutos) * 60000;
      return milissegundos;
    }
    return 0;
  }

  getDiaSemanaFormatado(diaSemana: number): string {
    return this.diasDaSemana[diaSemana];
  }

  exibirAlocacao(alocacao: Alocacao, diaSemana: string): boolean {
    // if (alocacao.horario.diaSemana.toString() == diaSemana) {
    //   return true;
    // }

    return false;
  }
}
