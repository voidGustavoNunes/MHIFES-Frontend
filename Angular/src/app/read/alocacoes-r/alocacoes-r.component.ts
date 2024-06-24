import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localePT from '@angular/common/locales/pt';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { Calendar } from 'primeng/calendar';
import { Dropdown } from 'primeng/dropdown';
import { Subscription } from 'rxjs';

import { AlocacaoHour } from '../../models/postgres/alocacao.models';
import { Aluno } from '../../models/postgres/aluno.models';
import { Disciplina } from '../../models/postgres/disciplina.models';
import { Horario } from '../../models/postgres/horario.models';
import { Local } from '../../models/postgres/local.models';
import { Log, Operacao } from '../../models/postgres/log.models';
import { Periodo, PeriodoDisciplina } from '../../models/postgres/periodo.models';
import { Professor } from '../../models/postgres/professor.models';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { Semana } from '../../models/share/semana.models';
import { AlocacaoService } from '../../service/alocacao.service';
import { HorarioService } from '../../service/horario.service';
import { LocalService } from '../../service/local.service';
import { PeriodoService } from '../../service/periodo.service';
import { ProfessorService } from '../../service/professor.service';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { Alocacao } from '../../models/postgres/alocacao.models';
import { Page } from '../../models/share/page.models';
import { PaginatorState } from 'primeng/paginator';
import { AlocacaoMySQL } from '../../models/mysql/alocacao-mysql.models';
import { MigrationService } from '../../service/migration.service';

registerLocaleData(localePT);
interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-alocacoes-r',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PrimeNgImportsModule,
    NgxMaskDirective
  ],
  templateUrl: './alocacoes-r.component.html',
  styleUrl: './alocacoes-r.component.scss',
  providers: [
    AlocacaoService,
    ConfirmationService,
    MessageService,
    // AlunoService,
    ProfessorService,
    LocalService,
    PeriodoService,
    // DisciplinaService,
    HorarioService,
    provideNgxMask(),
    MigrationService
  ]
})
export class AlocacoesRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  @ViewChild('searchInputInat') inputSearchInat!: ElementRef;
  @ViewChild('dropdownDisc') dropdownDisc!: Dropdown;
  @ViewChild('dropdownPeriodo') dropdownPeriodo!: Dropdown;
  @ViewChild('dropdownLocal') dropdownLocal!: Dropdown;
  @ViewChild('dropdownProf') dropdownProf!: Dropdown;
  @ViewChild('dropdownHour') dropdownHour!: Dropdown;
  @ViewChild('calendar') calendar!: Calendar;
  @ViewChild('calendarAula') calendarAula!: Calendar;

  @ViewChild('calendarIntervalo') calendarIntervalo!: Calendar;

  alocacoesData: Alocacao[] = [];
  alocacoesFilter: Alocacao[] = [];

  alocacoesCadast: Alocacao[] = [];
  alocacoesEdit: Alocacao[] = [];
  alocacaoInfo!: Alocacao;

  alocacoesDataDelete: Alocacao[] = [];
  alocacoesDeleteFilter: Alocacao[] = [];
  selectedFilterInat!: FiltrarPesquisa;

  unsubscribe$!: Subscription;
  unsubscribe$Prof!: Subscription;
  unsubscribe$Per!: Subscription;
  unsubscribe$Loc!: Subscription;
  unsubscribe$Hor!: Subscription;
  unsubscribe$Log!: Subscription;
  unsubscribe$Migr!: Subscription;

  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;

  messages!: Message[];

  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;
  txtFilter: string = 'Pesquisar alocação';
  txtFilterInat: string = 'Pesquisar alocação deletada';

  professoresArray: Professor[] = [];
  locaisArray: Local[] = [];
  periodosArray: Periodo[] = [];
  selectedPeriodo!: Periodo;
  periodosDisciplinaArray: PeriodoDisciplina[] = [];
  horariosArray: Horario[] = [];

  visibleEdit: boolean = false;
  visibleInfo: boolean = false;

  opcaoSemana: Semana[] = [];
  selectedDiasSemana: Semana[] = [];
  diasIntervalo: Date[] = [];

  enableDataAula: boolean = false;
  disableDiaSemana: boolean = true;

  minDate!: Date;
  maxDate!: Date;
  minDateAula!: Date;
  maxDateAula!: Date;
  alocacaoHour: AlocacaoHour[] = [];

  logsData: Log[] = [];
  visibleLog: boolean = false;

  enableSelect: boolean = false;
  enableDisciplina: boolean = false;
  enableCalendar: boolean = false;

  // Tabela
  cols!: Column[];

  firstAloc: number = 0;
  pageAloc: number = 0;
  rowsAloc: number = 10;
  sizeAloc: number = 0;

  sizeAlocTemp: number = 0;

  firstDelAloc: number = 0;
  pageDelAloc: number = 0;
  rowsDelAloc: number = 10;
  sizeDelAloc: number = 0;

  sizeDelAlocTemp: number = 0;

  alocacoesPageData!: Page<Alocacao>;
  alocacoesDelPageData!: Page<Alocacao>;
  horariosPageData!: Page<Horario>;
  locaisPageData!: Page<Local>;
  periodosPageData!: Page<Periodo>;
  professoresPageData!: Page<Professor>;

  visibleMigra: boolean = false;
  mysqlAlocacoes: AlocacaoMySQL[] = [];
  dataMysqlAlocacoes: AlocacaoMySQL[] = [];

  constructor(
    private alocService: AlocacaoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    // private alunService: AlunoService,
    // private disciService: DisciplinaService,
    private locService: LocalService,
    private periodService: PeriodoService,
    private professorService: ProfessorService,
    private hourService: HorarioService,
    private migraService: MigrationService,
  ) {
    this.form = this.formBuilder.group({
      id: [null],
      horario: [null, [Validators.required]],
      turma: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      dataAula: [null, [Validators.required]],
      local: [null, [Validators.required]],
      professor: [null, [Validators.required]],
      periodoDisciplina: [null, [Validators.required]],
    })
    // , { validator: this.verificarHoraFimMaiorQueInicio });
  }

  ngOnInit() {
    this.opcaoSemana = [
      { nome: 'Domingo', code: 0 },
      { nome: 'Segunda-feira', code: 1 },
      { nome: 'Terça-feira', code: 2 },
      { nome: 'Quarta-feira', code: 3 },
      { nome: 'Quinta-feira', code: 4 },
      { nome: 'Sexta-feira', code: 5 },
      { nome: 'Sábado', code: 6 }
    ];

    this.filterOptions = [
      { nome: 'Nome do Professor', id: 0 },
      { nome: 'Nome do Local', id: 1 },
      { nome: 'Nome da Disciplina', id: 2 },
      { nome: 'Hora de início', id: 3 },
    ];

    this.unsubscribe$ = this.alocService.listarAtivos(0, 10)
      .subscribe({
        next: (itens: any) => {
          this.alocacoesPageData = itens;
          this.sizeAloc = this.alocacoesPageData.totalElements;

          this.alocacoesData = this.alocacoesPageData.content;

          // this.alocacoesData.sort((a: Alocacao, b: Alocacao) => {
          //   if ((a.dataAula === undefined || b.dataAula === undefined) || (a.dataAula === null || b.dataAula === null)) {
          //     return 0;
          //   }
          //   const dateA = new Date(a.dataAula);
          //   const dateB = new Date(b.dataAula);
          //   return dateB.getTime() - dateA.getTime();
          // });

          // this.listarPage()
          this.listarPageObj(0)
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Dados de alocações não encontrados.', life: 3000 },
          ];
        }
      });

    this.unsubscribe$Loc = this.locService.listar(0, 10)
      .subscribe({
        next: (itens: any) => {
          this.locaisPageData = itens
          this.listarPageObj(2)
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Dados de locais não encontrados.' },
          ];
        }
      });

    this.unsubscribe$Prof = this.professorService.listar(0, 10)
      .subscribe({
        next: (itens: any) => {
          this.professoresPageData = itens
          this.listarPageObj(4)
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Dados de professores não encontrados.', life: 3000 },
          ];
        }
      });

    this.unsubscribe$Hor = this.hourService.listar(0, 10)
      .subscribe({
        next: (itens: any) => {
          this.horariosPageData = itens
          this.listarPageObj(1)
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Dados de horários não encontrados.', life: 3000 },
          ];
        }
      });

    this.unsubscribe$Per = this.periodService.listar(0, 10)
      .subscribe({
        next: (itens: any) => {
          this.periodosPageData = itens
          this.listarPageObj(3)
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Dados de períodos não encontrados.', life: 3000 },
          ];
        }
      });

    this.unsubscribe$Migr = this.migraService.listaMysql()
      .subscribe({
        next: (itens: any) => {
          this.dataMysqlAlocacoes = itens
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Dados de mysql alocações não encontrados.', life: 3000 },
          ];
        }
      });

    // Colunas da tabela
    this.cols = [
      { field: 'disciplina', header: 'Disciplina' },
      { field: 'professor', header: 'Professor' },
      { field: 'local', header: 'Local' },
      { field: 'periodo', header: 'Período' },
      { field: 'horario', header: 'Horário' },
      { field: 'dataAula', header: 'Data' },
      { field: 'turma', header: 'Turma' },
      { field: 'alunos', header: 'Alunos' }
    ];
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
    this.unsubscribe$Loc.unsubscribe();
    this.unsubscribe$Per.unsubscribe();
    this.unsubscribe$Prof.unsubscribe();
    this.unsubscribe$Hor.unsubscribe();
  }

  onPageChange(event: PaginatorState, stat: number) {
    if (event.first !== undefined && event.rows !== undefined && event.page !== undefined) {
      if (stat == 0) {
        this.firstAloc = event.first;
        this.rowsAloc = event.rows;
        this.pageAloc = event.page;
        this.listarPageAt()
      } else if (stat == 1) {
        this.firstDelAloc = event.first;
        this.rowsDelAloc = event.rows;
        this.pageDelAloc = event.page;
        this.listarPageInat()
      }
    }
  }

  listarPageAt() {
    this.alocService.listarAtivos(this.pageAloc, this.rowsAloc).subscribe(alcc => {
      this.alocacoesData = alcc.content;

      this.firstAloc = 0
      this.sizeAloc = this.sizeAlocTemp
      this.rowsAloc = 10
    });
  }

  listarPageInat() {
    this.alocService.listarInativos(this.pageDelAloc, this.rowsDelAloc).subscribe(alcc => {
      this.alocacoesDataDelete = alcc.content;

      this.firstDelAloc = 0
      this.sizeDelAloc = this.sizeDelAlocTemp
      this.rowsDelAloc = 10
    });
  }

  listarPageObj(object: number) {
    if (object == 0) {
      this.alocService.listarInativos(0, 10).subscribe(alcc => {
        this.alocacoesDataDelete = alcc.content

        if (this.alocacoesDataDelete.length > 0) {
          this.alocacoesDataDelete.sort((a: Alocacao, b: Alocacao) => {
            if ((a.dataAula === undefined || b.dataAula === undefined) || (a.dataAula === null || b.dataAula === null)) {
              return 0;
            }
            const dateA = new Date(a.dataAula);
            const dateB = new Date(b.dataAula);
            return dateB.getTime() - dateA.getTime();
          });
          this.sizeDelAloc = this.alocacoesDataDelete.length
        }
      })
      this.pageFilter()
    } else if (object == 1) {
      let sizeUm = this.horariosPageData.totalElements
      if (sizeUm > 0) {
        this.hourService.listar(0, sizeUm).subscribe(hor => this.horariosArray = hor.content)
        this.horariosArray.sort((a: Horario, b: Horario) => {
          let hAi = this.formatMiliss(a.horaInicio)
          let hBi = this.formatMiliss(b.horaFim)

          if (hAi < hBi) {
            return -1;
          } else if (hAi > hBi) {
            return 1;
          } else {
            return 0;
          }
        })
      }
    } else if (object == 2) {
      let sizeDois = this.locaisPageData.totalElements
      if (sizeDois > 0) {
        this.locService.listar(0, sizeDois).subscribe(locs => this.locaisArray = locs.content)
        this.locaisArray.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1)
      }
    } else if (object == 3) {
      let sizeTres = this.periodosPageData.totalElements
      if (sizeTres > 0) {
        this.periodService.listar(0, sizeTres).subscribe(pero => this.periodosArray = pero.content)
        this.periodosArray.sort((a: Periodo, b: Periodo) => {
          const dateA = new Date(a.dataInicio);
          const dateB = new Date(b.dataInicio);
          return dateB.getTime() - dateA.getTime();
        });
      }
    } else if (object == 4) {
      let sizeQuatro = this.professoresPageData.totalElements
      if (sizeQuatro > 0) {
        this.professorService.listar(0, sizeQuatro).subscribe(prfs => this.professoresArray = prfs.content)
        this.professoresArray.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1)
      }
    }
  }

  pageFilter() {
    if (this.sizeAloc > 0) {
      this.alocService.listarAtivos(0, this.sizeAloc).subscribe(alcc => {
        this.alocacoesFilter = alcc.content
      })
    }
    if (this.sizeDelAloc > 0) {
      this.alocService.listarInativos(0, this.sizeDelAloc).subscribe(alcc => {
        this.alocacoesDeleteFilter = alcc.content
      })
    }
  }

  showMigraDialog() {
    this.visibleMigra = true;
  }

  showDialogLog(valueLog: Alocacao) {
    this.visibleLog = true;

    this.unsubscribe$Log = this.alocService.buscarPorIdRegistro(valueLog.id)
      .subscribe({
        next: (itens: any) => {
          const data = itens.sort((a: Log, b: Log) => (a.id > b.id) ? 1 : -1);
          this.logsData = data;
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Logs de alocação não encontrados.', life: 3000 },
          ];
        }
      });
  }

  showInfoDialog(valueInfo: Alocacao) {
    this.visibleInfo = true;
    this.alocacaoInfo = valueInfo;
  }

  showEditDialog(value: Alocacao, dtEv: string | null) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Alocação'
    this.visibleEdit = true;
    this.visibleInfo = false;
    this.cadastrar = false;
    this.editar = true;
    this.form.patchValue({
      id: value.id,
      horario: value.horario,
      turma: value.turma,
      dataAula: value.dataAula,
      local: value.local,
      professor: value.professor,
      periodoDisciplina: value.periodoDisciplina,
    })

    if (dtEv != null) {
      const eventoData = this.formatarDtStrDt(dtEv);
      this.calendar.writeValue(eventoData);
    }

    let perEdit = value.periodoDisciplina;
    if (perEdit && perEdit?.periodo && this.periodosArray) {
      for (const ped of this.periodosArray) {
        console.log('if 2 ', ped == perEdit.periodo)
        console.log('if 1 ', ped)
        console.log('if 1 ', perEdit.periodo)
        if (ped.id == perEdit.periodo.id) {
          this.selectedPeriodo = ped;
          this.updateDisciplinaStateEdit()
        }
      }
    }
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Alocação';
    this.visible = true;
    this.visibleInfo = false;
    this.cadastrar = true;
    this.editar = false;
    this.alocacaoHour = [];

    let nulo!: Periodo;
    this.selectedPeriodo = nulo;
    this.periodosDisciplinaArray = [];
  }

  hideDialog() {
    if (this.cadastrar) {
      this.visible = false;
    } else if (this.editar) {
      this.visibleEdit = false;
    } else if (this.visibleMigra) {
      this.visibleMigra = false;
      this.mysqlAlocacoes = []
    }
    this.form.reset();
    this.visibleLog = false;
    this.alocacaoHour = [];

    let nulo!: Periodo;
    this.selectedPeriodo = nulo;
    this.periodosDisciplinaArray = [];
  }

  calcularDiasSemana(dtIni: Date, dtFim: Date, diasSemana: number[]): Date[] {
    let diasSemanaArray: Date[] = [];

    diasSemana.forEach(diaSemana => {
      let dataTemp = new Date(dtIni);

      dataTemp.setDate(dataTemp.getDate() + (diaSemana - dataTemp.getDay() + 7) % 7);

      while (dataTemp <= dtFim) {
        if (dataTemp >= dtIni && dataTemp <= dtFim) {
          diasSemanaArray.push(new Date(dataTemp));
        }
        dataTemp.setDate(dataTemp.getDate() + 7);
      }
    });

    if (!diasSemanaArray.some(dia => dia.getTime() === dtIni.getTime())) {
      diasSemanaArray.push(new Date(dtIni));
    }
    if (!diasSemanaArray.some(dia => dia.getTime() === dtFim.getTime())) {
      diasSemanaArray.push(new Date(dtFim));
    }

    diasSemanaArray.sort((a, b) => a.getTime() - b.getTime());

    return diasSemanaArray;
  }

  atualizarDiasSemana(codes: number[]) {
    let ini: Date = this.form.get('dataAula')?.value;
    // let periodo: Periodo = this.form.get('periodoDisciplina.periodo')?.value;

    if (ini && this.selectedPeriodo) {
      const periodoFim = new Date(this.selectedPeriodo.dataFim);
      this.diasIntervalo = this.calcularDiasSemana(ini, periodoFim, codes);
    }
  }

  onMultiselectChange() {
    let ini: Date = this.form.get('dataAula')?.value;
    // let periodo: Periodo = this.form.get('periodoDisciplina.periodo')?.value;
    let hora: Horario = this.form.get('horario')?.value;

    if (ini && this.selectedDiasSemana && this.selectedPeriodo && hora) {
      let codes: number[] = this.selectedDiasSemana.map(selD => selD.code);
      this.selectedDiasSemana.forEach(selD => {
        const existe = this.alocacaoHour.some(item => item.diaSemana === selD);

        if (!existe) {
          this.alocacaoHour.push({
            diaSemana: selD, horario: hora
          })
        }
      })
      this.alocacaoHour = this.alocacaoHour.filter(item => this.selectedDiasSemana?.includes(item.diaSemana));

      this.atualizarDiasSemana(codes);

      this.minDate = new Date(ini);
      this.minDate.setDate(this.minDate.getDate() + 1);
      this.minDate.setMonth(this.minDate.getMonth());
      this.minDate.setFullYear(this.minDate.getFullYear());

      this.maxDate = new Date(this.selectedPeriodo.dataFim);
      this.maxDate.setDate(this.maxDate.getDate());
      this.maxDate.setMonth(this.maxDate.getMonth());
      this.maxDate.setFullYear(this.maxDate.getFullYear());

    } else {
      this.diasIntervalo = [];
    }
  }

  onChangeHourIni() {
    let ini: Date = this.form.get('dataAula')?.value;

    this.alocacaoHour.find(alocH => {
      const diaDaSemana = this.obterDiaDaSemana(ini);
      if (diaDaSemana == alocH.diaSemana.nome) {
        this.form.patchValue({
          horario: alocH.horario,
        });
        this.dropdownHour.writeValue(alocH.horario)
      }
    })
  }

  onSwitchChange(e: any) {
    console.log('Checkbox selecionado:', e.checked);
    if(e.checked) {
      this.enableCalendar = true;
    } else {
      this.enableCalendar = false;
    }
  }

  verificarDataHour() {
    this.diasIntervalo?.sort((a: Date, b: Date) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    this.onMultiselectChange();
  }

  onDateIniSelect() {
    const dataAula = this.form.get('dataAula')?.value;
    // const periodo: Periodo = this.form.get('periodoDisciplina.periodo')?.value;

    if (dataAula && this.selectedPeriodo) {
      const periodoInicio = new Date(this.selectedPeriodo.dataInicio);
      const periodoFim = new Date(this.selectedPeriodo.dataFim);
      const dataAulaValida = new Date(dataAula) >= periodoInicio && new Date(dataAula) <= periodoFim;

      if (dataAulaValida) {
        this.form.get('dataAula')?.setErrors(null);
        this.disableDiaSemana = false;
        if (this.alocacaoHour.length > 0) {
          this.alocacaoHour = [];
          this.diasIntervalo = [];
          this.selectedDiasSemana = [];
        }
      } else {
        this.form.get('dataAula')?.setErrors({ 'invalidEndDate': true });
        this.disableDiaSemana = true;
        this.alocacaoHour = [];
        this.diasIntervalo = [];
      }
    }
    this.updateSelectState();
  }

  updateSelectState() {
    let hora: Horario = this.form.get('horario')?.value;
    let ini: Date = this.form.get('dataAula')?.value;

    if (ini && hora) {
      this.enableSelect = true;
    } else {
      this.enableSelect = false;
      this.alocacaoHour = [];
    }
  }

  updateDisciplinaState() {
    if (this.selectedPeriodo && this.selectedPeriodo.dataInicio && this.selectedPeriodo.dataFim) {
      this.minDateAula = new Date(this.selectedPeriodo.dataInicio);
      this.minDateAula.setDate(this.minDateAula.getDate());
      this.minDateAula.setMonth(this.minDateAula.getMonth());
      this.minDateAula.setFullYear(this.minDateAula.getFullYear());

      this.maxDateAula = new Date(this.selectedPeriodo.dataFim);
      this.maxDateAula.setDate(this.maxDateAula.getDate());
      this.maxDateAula.setMonth(this.maxDateAula.getMonth());
      this.maxDateAula.setFullYear(this.maxDateAula.getFullYear());

      this.periodosDisciplinaArray = this.selectedPeriodo.periodoDisciplinas;
      this.enableDisciplina = true;

      let discp: Disciplina = this.form.get('periodoDisciplina.disciplina')?.value;
      if (discp) {
        this.form.patchValue({
          periodoDisciplina: null
        })
      }
    } else {
      this.periodosDisciplinaArray = [];
      this.enableDisciplina = false;
      this.form.patchValue({
        periodoDisciplina: null
      })
    }
  }

  updateDisciplinaStateEdit() {
    let perdisc: PeriodoDisciplina = this.form.get('periodoDisciplina')?.value;
    if (this.selectedPeriodo && this.selectedPeriodo.dataInicio && this.selectedPeriodo.dataFim) {
      this.minDateAula = new Date(this.selectedPeriodo.dataInicio);
      this.minDateAula.setDate(this.minDateAula.getDate());
      this.minDateAula.setMonth(this.minDateAula.getMonth());
      this.minDateAula.setFullYear(this.minDateAula.getFullYear());

      this.maxDateAula = new Date(this.selectedPeriodo.dataFim);
      this.maxDateAula.setDate(this.maxDateAula.getDate());
      this.maxDateAula.setMonth(this.maxDateAula.getMonth());
      this.maxDateAula.setFullYear(this.maxDateAula.getFullYear());


      console.log('perdisc ', this.selectedPeriodo)
      this.periodosDisciplinaArray = this.selectedPeriodo.periodoDisciplinas;

      if (perdisc.periodo?.id != this.selectedPeriodo.id) {
        this.form.patchValue({
          periodoDisciplina: null,
          dataAula: null
        })
      } else {
        for (const ped of this.selectedPeriodo.periodoDisciplinas) {
          if (perdisc.id == ped.id) {
            this.form.patchValue({
              periodoDisciplina: ped
            })
          }
        }
      }
    }
  }

  updateDataAulaState() {
    let perDisc: PeriodoDisciplina = this.form.get('periodoDisciplina')?.value;
    if (perDisc) {
      let discp: Disciplina = perDisc.disciplina;
      if (discp) {
        let perIni: Date = new Date(this.selectedPeriodo.dataInicio);
        let ini: Date = perIni;
        ini.setDate(ini.getDate() + 1);

        // perDisc.periodo = this.selectedPeriodo;

        this.form.patchValue({
          dataAula: ini,
          // periodoDisciplina: perDisc
        });
        // this.calendarAula.writeValue(ini)
        this.onDateIniSelect();
        this.enableDataAula = true;
      } else {
        this.form.patchValue({
          dataAula: null
        });
        // this.calendarAula.writeValue(null)
        this.onDateIniSelect();
        this.enableDataAula = false;
      }
    }
  }

  limparFilter(tipo: string) {
    if (tipo == 'a') {
      const inputElement = this.inputSearch.nativeElement.value
      if (inputElement) {
        this.inputSearch.nativeElement.value = '';
      }
      this.selectedFilter = {} as FiltrarPesquisa;
      this.listarPageAt()
    } else if (tipo == 'i') {
      const inputElement = this.inputSearchInat.nativeElement.value
      if (inputElement) {
        this.inputSearchInat.nativeElement.value = '';
      }
      this.selectedFilterInat = {} as FiltrarPesquisa;
      this.listarPageInat()
    }
  }

  searchFilter0(tipo: string, term: string) {
    if (tipo == 'a') {
      this.alocService.acharProfessorAtivo(0, 10, term).subscribe(alcc => {
        this.alocacoesFilter = alcc.content
        this.alocacoesData = this.alocacoesFilter
        this.sizeAlocTemp = this.sizeAloc
        this.sizeAloc = alcc.totalElements
      })
    } else if (tipo == 'i') {
      this.alocService.acharProfessorInativo(0, 10, term).subscribe(alcc => {
        this.alocacoesDeleteFilter = alcc.content
        this.alocacoesDataDelete = this.alocacoesDeleteFilter
        this.sizeDelAlocTemp = this.sizeDelAloc
        this.sizeDelAloc = alcc.totalElements
      })
    }
  }

  searchFilter1(tipo: string, term: string) {
    if (tipo == 'a') {
      this.alocService.acharLocalAtivo(0, 10, term).subscribe(alcc => {
        this.alocacoesFilter = alcc.content
        this.alocacoesData = this.alocacoesFilter
        this.sizeAlocTemp = this.sizeAloc
        this.sizeAloc = alcc.totalElements
      })
    } else if (tipo == 'i') {
      this.alocService.acharLocalInativo(0, 10, term).subscribe(alcc => {
        this.alocacoesDeleteFilter = alcc.content
        this.alocacoesDataDelete = this.alocacoesDeleteFilter
        this.sizeDelAlocTemp = this.sizeDelAloc
        this.sizeDelAloc = alcc.totalElements
      })
    }
  }

  searchFilter2(tipo: string, term: string) {
    if (tipo == 'a') {
      this.alocService.acharDisciplinaAtivo(0, 10, term).subscribe(alcc => {
        this.alocacoesFilter = alcc.content
        this.alocacoesData = this.alocacoesFilter
        this.sizeAlocTemp = this.sizeAloc
        this.sizeAloc = alcc.totalElements
      })
    } else if (tipo == 'i') {
      this.alocService.acharDisciplinaInativo(0, 10, term).subscribe(alcc => {
        this.alocacoesDeleteFilter = alcc.content
        this.alocacoesDataDelete = this.alocacoesDeleteFilter
        this.sizeDelAlocTemp = this.sizeDelAloc
        this.sizeDelAloc = alcc.totalElements
      })
    }
  }

  searchFilter3(tipo: string, term: string) {
    if (tipo == 'a') {
      this.alocService.acharHorarioAtivo(0, 10, term).subscribe(alcc => {
        this.alocacoesFilter = alcc.content
        this.alocacoesData = this.alocacoesFilter
        this.sizeAlocTemp = this.sizeAloc
        this.sizeAloc = alcc.totalElements
      })
    } else if (tipo == 'i') {
      this.alocService.acharHorarioInativo(0, 10, term).subscribe(alcc => {
        this.alocacoesDeleteFilter = alcc.content
        this.alocacoesDataDelete = this.alocacoesDeleteFilter
        this.sizeDelAlocTemp = this.sizeDelAloc
        this.sizeDelAloc = alcc.totalElements
      })
    }
  }

  onKeyDown(tipo: string, event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      this.filterField(tipo, searchTerm);
    }
  }

  filterField(tipo: string, searchTerm: string) {
    if (searchTerm && (searchTerm != null || searchTerm != '')) {
      if (tipo == 'a') {
        if (this.selectedFilter) {
          if (this.selectedFilter.id == 0) this.searchFilter0(tipo, searchTerm);
          if (this.selectedFilter.id == 1) this.searchFilter1(tipo, searchTerm);
          if (this.selectedFilter.id == 2) this.searchFilter2(tipo, searchTerm);
          if (this.selectedFilter.id == 3) this.searchFilter3(tipo, searchTerm);
        } else {
          this.messages = [
            { severity: 'warn', summary: 'Atenção', detail: 'Selecione um filtro!', life: 3000 },
          ];
        }
      } else if (tipo == 'i') {
        if (this.selectedFilterInat) {
          if (this.selectedFilterInat.id == 0) this.searchFilter0(tipo, searchTerm);
          if (this.selectedFilterInat.id == 1) this.searchFilter1(tipo, searchTerm);
          if (this.selectedFilterInat.id == 2) this.searchFilter2(tipo, searchTerm);
          if (this.selectedFilterInat.id == 3) this.searchFilter3(tipo, searchTerm);
        } else {
          this.messages = [
            { severity: 'warn', summary: 'Atenção', detail: 'Selecione um filtro!', life: 3000 },
          ];
        }
      }
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha o campo!', life: 3000 },
      ];
    }
  }

  formatarDatas(date: string) {
    if (date) {
      const partes = date.split('-');
      const ano = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const dia = parseInt(partes[2], 10);

      const data = new Date(ano, mes, dia);

      const diaFormatado = ('0' + data.getDate()).slice(-2);
      const mesFormatado = ('0' + (data.getMonth() + 1)).slice(-2);
      const anoFormatado = data.getFullYear();

      return `${diaFormatado}/${mesFormatado}/${anoFormatado}`;
    } else {
      return null;
    }
  }

  formatarDtStrDt(date: string) {
    if (date) {
      const partes = date.split('/');
      const ano = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const dia = parseInt(partes[2], 10);

      return new Date(dia, mes, ano);
    } else {
      return null;
    }
  }

  formatarTmStrTm(tempo: any) {
    if (tempo) {
      const partes = tempo.split(':');
      const horas = parseInt(partes[0], 10);
      const minutos = parseInt(partes[1], 10) - 1;

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

      return `${horas}h ${minutos}min`;
    } else {
      return `00:00`;
    }
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

  updateMask(tipo: string) {
    if (tipo == 'a') {
      if (this.selectedFilter?.id == 3) {
        this.txtFilter = '00:00';
      } else {
        this.txtFilter = 'Pesquisar alocação';
      }
    } else if (tipo == 'i') {
      if (this.selectedFilterInat?.id == 3) {
        this.txtFilterInat = '00:00';
      } else {
        this.txtFilterInat = 'Pesquisar alocação deletada';
      }
    }
  }

  confirm2(event: Event, id: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Deseja excluir esse registro?',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.deletarID(id);
      },
      reject: () => {
        this.messages = [
          { severity: 'info', summary: 'Cancelado', detail: 'Exclusão cancelada.', life: 3000 },
        ];
      }
    });
  }

  enviarFormSave() {
    this.alocService.criar(this.alocacoesCadast).subscribe({
      next: (data: any) => {
        this.alocacoesCadast = data;
        // this.goToRouteSave();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Alocação cadastrada com sucesso!', life: 5000 },
        ];
        this.ngOnInit();
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: err, life: 5000, sticky: true },
        ];
      }
    });
  }

  enviarFormEdit(id: number) {
    this.alocService.atualizar(id, this.alocacoesEdit).subscribe({
      next: (data: any) => {
        this.alocacoesEdit = data;
        // this.goToRouteEdit(id);
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Alocação editada com sucesso!', life: 5000 },
        ];
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: err, life: 5000, sticky: true },
        ];
      }
    });
  }

  onSubmit() {
    console.log(this.form.value)

    if (this.form.valid && this.cadastrar) {
      this.conditionCreateSave();
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
    } else if (this.form.valid && this.editar) {
      this.alocacoesEdit = this.form.value;
      this.enviarFormEdit(this.form.get('id')?.value);
      this.visibleEdit = false;
      this.form.reset();
      this.ngOnInit();
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha os campos!', life: 3000 },
      ];
    }
  }

  saveMigrationMysql() {
    if (this.mysqlAlocacoes.length > 0) {
      this.migraService.migrateAlocacoes(this.mysqlAlocacoes).subscribe({
        next: (data: any) => {
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: data, life: 3000 },
            // { severity: 'success', summary: 'Sucesso', detail: 'Migração realizada com sucesso!', life: 3000 },
          ];
          this.hideDialog();
          this.ngOnInit();
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Migração não enviada.', life: 3000 },
          ];
        }
      });
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Selecione ao menos uma opção!', life: 3000 },
      ];
    }
  }

  obterDiaDaSemana(date: Date): string {
    const diasDaSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const diaDaSemanaNumero = date.getDay();
    return diasDaSemana[diaDaSemanaNumero];
  }

  getSeverity(operacao: Operacao) {
    switch (operacao.toString()) {
      case 'ALTERACAO':
        return 'warning';
      case 'INCLUSAO':
        return 'info';
      case 'EXCLUSAO':
        return 'danger';
      default:
        return 'success';
    }
  }

  getIcons(operacao: Operacao) {
    switch (operacao.toString()) {
      case 'ALTERACAO':
        return 'pi pi-pencil';
      case 'INCLUSAO':
        return 'pi pi-save';
      case 'EXCLUSAO':
        return 'pi pi-trash';
      default:
        return 'pi pi-save';
    }
  }

  conditionCreateSave() {
    const ini: Date = this.form.get('dataAula')?.value;

    if (this.diasIntervalo) {
      //  DATA INÍCIO
      this.alocacoesCadast = this.form.value;
      this.enviarFormSave();

      //  DATAS INTERVALO
      const ultimoDiaIntervalo = new Date(this.diasIntervalo[this.diasIntervalo.length - 1]);

      this.diasIntervalo.forEach((dt: Date) => {
        if (dt.getTime() != ini?.getTime()) {
          this.alocacaoHour.find(alocH => {
            const diaDaSemana = this.obterDiaDaSemana(dt);
            if (diaDaSemana == alocH.diaSemana.nome) {
              this.form.patchValue({
                dataAula: dt,
                horario: alocH.horario
              });
              if (new Date(dt).getTime() === ultimoDiaIntervalo.getTime()) {
              }
              this.alocacoesCadast = this.form.value;
              this.enviarFormSave();
            }
          })
        }
      });
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha os campos!', life: 3000 },
      ];
    }
  }

  deletarID(id: number) {
    this.alocService.excluir(id)
      .subscribe({
        next: (data: any) => {
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Registro deletado com sucesso!', life: 5000 },
          ];
          this.ngOnInit();
        },
        error: (err: any) => {
          if (err.status) {
            this.messages = [
              { severity: 'error', summary: 'Erro', detail: err, life: 5000, sticky: true },
            ];
          } else {
            this.messages = [
              { severity: 'error', summary: 'Erro desconhecido', detail: err, life: 5000 },
            ];
          }
        }
      });
  }

  jsonForObject(descricao: string | null): any {
    if (!descricao) {
      return null;
    }
    let alocacao: Alocacao = JSON.parse(descricao);
    return alocacao;
  }

  isDifferent(antiga: any, nova: any, field: string): boolean {
    if (!antiga && !nova) {
        return false;
    }
    if (!antiga || !nova) {
        return true;
    }
    return this.formatarApresentacao(antiga, field) !== this.formatarApresentacao(nova, field);
  }

  shouldDisplayField(log: any, field: string): boolean {
    const antiga = this.jsonForObject(log.descricaoAntiga);
    const nova = this.jsonForObject(log.descricaoNova);
    if (log.operacao === 'Exclusão') {
        return !!antiga;
    }
    return this.isDifferent(antiga, nova, field);
  }

  formatarApresentacao(alocacao: Alocacao, field: string): any {
    if (!alocacao) {
      return '';
    }

    const datePipe = new DatePipe('pt-BR');

    switch (field) {
      case 'disciplina':
        return alocacao.periodoDisciplina.disciplina.nome;
      case 'professor':
        return alocacao.professor.nome;
      case 'local':
        if (alocacao.local == null) {
          return 'Sem local';
        }
        return alocacao.local.nome;
      case 'periodo':
        if (alocacao.periodoDisciplina.periodo) {
          return `${datePipe.transform(alocacao.periodoDisciplina.periodo.dataInicio, 'dd/MM/yyyy')} - ${datePipe.transform(alocacao.periodoDisciplina.periodo.dataFim, 'dd/MM/yyyy')}`;
        }
        break;
      case 'horario':
        return `${alocacao.horario.horaInicio}min - ${alocacao.horario.horaFim}min`;
      case 'dataAula':
        if (alocacao.dataAula === undefined || alocacao.dataAula === null) {
          return 'Sem data';
        }
        return datePipe.transform(alocacao.dataAula, 'dd/MM/yyyy');
      case 'turma':
        return alocacao.turma;
      case 'alunos':
        if (alocacao.periodoDisciplina.alunos.length > 0) {
          return alocacao.periodoDisciplina.alunos.map((aluno: Aluno) => aluno.nome).join(', ');
        }
        return 'Sem alunos';
      default:
        return '';
    }
  }

  formatarDiferenca(valorAnterior: any, valorAtual: any): any {
    if (valorAnterior !== valorAtual && valorAnterior !== undefined) {
      return `${valorAnterior} -> ${valorAtual}`;
    }
    return valorAtual;
  }
}
