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

import { AlocacaoHour } from '../../models/alocacao.models';
import { Aluno } from '../../models/aluno.models';
import { Disciplina } from '../../models/disciplina.models';
import { Horario } from '../../models/horario.models';
import { Local } from '../../models/local.models';
import { Log, Operacao } from '../../models/log.models';
import { Periodo, PeriodoDisciplina } from '../../models/periodo.models';
import { Professor } from '../../models/professor.models';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { Semana } from '../../models/share/semana.models';
import { AlocacaoService } from '../../service/alocacao.service';
import { HorarioService } from '../../service/horario.service';
import { LocalService } from '../../service/local.service';
import { PeriodoService } from '../../service/periodo.service';
import { ProfessorService } from '../../service/professor.service';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { Alocacao } from './../../models/alocacao.models';

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
    provideNgxMask()
  ]
})
export class AlocacoesRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  // @ViewChild('multiselect') multiselect!: MultiSelect;
  @ViewChild('dropdownDisc') dropdownDisc!: Dropdown;
  @ViewChild('dropdownPeriodo') dropdownPeriodo!: Dropdown;
  @ViewChild('dropdownLocal') dropdownLocal!: Dropdown;
  @ViewChild('dropdownProf') dropdownProf!: Dropdown;
  @ViewChild('dropdownHour') dropdownHour!: Dropdown;
  // @ViewChild('switch') switch!: InputSwitch;
  @ViewChild('calendar') calendar!: Calendar;
  @ViewChild('calendarAula') calendarAula!: Calendar;

  @ViewChild('calendarIntervalo') calendarIntervalo!: Calendar;

  alocacoesData: Alocacao[] = [];
  alocacoesFilter: Alocacao[] = [];
  alocacoesCadast: Alocacao[] = [];
  alocacoesEdit: Alocacao[] = [];
  alocacaoInfo!: Alocacao;

  unsubscribe$!: Subscription;
  // unsubscribe$Aln!: Subscription;
  // unsubscribe$Disc!: Subscription;
  unsubscribe$Prof!: Subscription;
  unsubscribe$Per!: Subscription;
  unsubscribe$Loc!: Subscription;
  unsubscribe$Hor!: Subscription;
  unsubscribe$Log!: Subscription;

  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;

  messages!: Message[];
  mss: boolean = false;

  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;
  txtFilter: string = 'Pesquisar alocação';

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

    this.unsubscribe$ = this.alocService.listar()
      .subscribe({
        next: (itens: any) => {
          const data = itens;

          data.sort((a: Alocacao, b: Alocacao) => {
            const dateA = new Date(a.dataAula);
            const dateB = new Date(b.dataAula);
            return dateB.getTime() - dateA.getTime();
          });
          // data.sort((a: Alocacao, b: Alocacao) => {
          //   const dateB = new Date(b.periodoDisciplina?.periodo?.dataInicio);
          //   const dateA = new Date(a.periodoDisciplina?.periodo?.dataInicio);
          //   return dateB.getTime() - dateA.getTime();
          // });
          this.alocacoesData = data;

          this.alocacoesFilter = this.alocacoesData;
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Dados de alocações não encontrados.', life: 3000 },
          ];
        }
      });

    this.unsubscribe$Loc = this.locService.listar()
      .subscribe({
        next: (itens: any) => {
          const data = itens;
          this.locaisArray = data.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1);
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Dados de locais não encontrados.' },
          ];
        }
      });

    this.unsubscribe$Per = this.periodService.listar()
      .subscribe({
        next: (itens: any) => {
          const data = itens;

          data.sort((a: Periodo, b: Periodo) => {
            const dateA = new Date(a.dataInicio);
            const dateB = new Date(b.dataInicio);
            return dateB.getTime() - dateA.getTime();
          });

          this.periodosArray = data;
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Dados de períodos não encontrados.', life: 3000 },
          ];
        }
      });

    this.unsubscribe$Prof = this.professorService.listar()
      .subscribe({
        next: (itens: any) => {
          const data = itens.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1);
          this.professoresArray = data;
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Dados de professores não encontrados.', life: 3000 },
          ];
        }
      });

    this.unsubscribe$Hor = this.hourService.listar()
      .subscribe({
        next: (itens: any) => {
          const data = itens.sort((a: any, b: any) => (a.id > b.id) ? -1 : 1);
          this.horariosArray = data;
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Dados de horários não encontrados.', life: 3000 },
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
    // this.unsubscribe$Aln.unsubscribe();
    // this.unsubscribe$Disc.unsubscribe();
    this.unsubscribe$Loc.unsubscribe();
    this.unsubscribe$Per.unsubscribe();
    this.unsubscribe$Prof.unsubscribe();
    // this.unsubscribe$Log.unsubscribe();
    this.unsubscribe$Hor.unsubscribe();
  }

  // verificarHoraFimMaiorQueInicio(formGroup: FormGroup) {
  //   const horaInicio = formGroup.get('horarioInicio')?.value;
  //   const horaFim = formGroup.get('horarioFim')?.value;

  //   if (horaInicio && horaFim && horaInicio >= horaFim) {
  //     formGroup.get('horarioFim')?.setErrors({ 'horaFimMenorQueInicio': true });
  //   } else {
  //     formGroup.get('horarioFim')?.setErrors(null);
  //   }
  // }

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

  showEditDialog(value: Alocacao, dtEv: string) {
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

    const eventoData = this.formatarDtStrDt(dtEv);

    this.calendar.writeValue(eventoData);
    this.dropdownPeriodo.writeValue(value.periodoDisciplina);
    this.dropdownLocal.writeValue(value.local);
    this.dropdownProf.writeValue(value.professor);
    this.dropdownHour.writeValue(value.horario);
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Alocação';
    this.visible = true;
    this.visibleInfo = false;
    this.cadastrar = true;
    this.editar = false;
    this.alocacaoHour = [];
  }

  hideDialog() {
    if (this.cadastrar) {
      this.visible = false;
    } else if (this.editar) {
      this.visibleEdit = false;
    }
    this.form.reset();
    this.visibleLog = false;
    this.alocacaoHour = [];
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
      this.calendarIntervalo.writeValue(this.diasIntervalo);
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

  onSwitchChange() {
    this.enableCalendar = !this.enableCalendar;
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
      console.log('discp ', this.selectedPeriodo.periodoDisciplinas)

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

  limparFilter() {
    const inputElement = this.inputSearch.nativeElement.value
    if (inputElement) {
      this.inputSearch.nativeElement.value = '';
    }
    this.selectedFilter = {} as FiltrarPesquisa;
    this.alocacoesData = this.alocacoesFilter;
  }

  searchFilter0(term: string) {
    this.alocacoesData = this.alocacoesFilter.filter(aloca => {
      if (aloca.professor.nome.toLowerCase().includes(term.toLowerCase())) {
        return aloca;
      } else {
        return null;
      }
    })
  }

  searchFilter1(term: string) {
    this.alocacoesData = this.alocacoesFilter.filter(aloca => {
      if (aloca.local.nome.toLowerCase().includes(term.toLowerCase())) {
        return aloca;
      } else {
        return null;
      }
    })
  }

  searchFilter2(term: string) {
    // this.alocacoesData = this.alocacoesFilter.filter(aloca => {
    //   if (aloca.disciplina.nome.toLowerCase().includes(term.toLowerCase())) {
    //     return aloca;
    //   } else {
    //     return null;
    //   }
    // })
  }

  searchFilter3(term: string) {
    const compA = this.formatarTmStrTm(term);
    if (compA != null) {
      this.alocacoesData = this.alocacoesFilter.filter(aloca => {
        const compB = this.formatarTmStrTm(aloca.horario.horaInicio);
        if (compB != null) {
          if (compA.horas === compB.horas && compA.minutos === compB.minutos) {
            return aloca;
          } else {
            return null;
          }
        } else {
          return null;
        }
      })
    }
    return null;
  }

  onKeyDown(event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      this.filterField(searchTerm);
    }
  }

  filterField(searchTerm: string) {
    if (searchTerm != null || searchTerm != '') {
      if (this.selectedFilter) {
        if (this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
        if (this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
        if (this.selectedFilter.id == 2) this.searchFilter2(searchTerm);
        if (this.selectedFilter.id == 3) this.searchFilter3(searchTerm);
      }
    }
  }

  formatarDatas(date: string) {
    const partes = date.split('-');
    const ano = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);

    const data = new Date(ano, mes, dia);

    const diaFormatado = ('0' + data.getDate()).slice(-2);
    const mesFormatado = ('0' + (data.getMonth() + 1)).slice(-2);
    const anoFormatado = data.getFullYear();

    return `${diaFormatado}/${mesFormatado}/${anoFormatado}`;
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
    const partes = tempo.split(':');
    const horas = partes[0];
    const minutos = partes[1];

    return `${horas}h ${minutos}min`;
  }

  updateMask() {
    if (this.selectedFilter?.id == 3) {
      this.txtFilter = '00:00';
    } else {
      this.txtFilter = 'Pesquisar alocação';
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
        if (this.mss) {
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Alocação cadastrada com sucesso!', life: 3000 },
          ];
          this.ngOnInit();
        }
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Cadastro não enviado.', life: 3000 },
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
          { severity: 'success', summary: 'Sucesso', detail: 'Alocação editada com sucesso!', life: 3000 },
        ];
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Edição não enviada.', life: 3000 },
        ];
      }
    });
  }

  onSubmit() {
    console.log(this.form.value)

    if (this.form.valid && this.cadastrar) {
      this.conditionCreateSave();
      this.mss = false;
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
                this.mss = true;
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
            { severity: 'success', summary: 'Sucesso', detail: 'Registro deletado com sucesso!', life: 3000 },
          ];
          this.ngOnInit();
        },
        error: (err: any) => {
          if (err.status) {
            this.messages = [
              { severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar registro.', life: 3000 },
            ];
          } else {
            this.messages = [
              { severity: 'error', summary: 'Erro desconhecido', detail: err, life: 3000 },
            ];
          }
        }
      });
  }

  jsonForObject(descricao: string): any {
    let alocacao: Alocacao = JSON.parse(descricao);
    return alocacao;
  }

  formatarApresentacao(alocacao: Alocacao, field: string): any {

    const datePipe = new DatePipe('pt-BR');

    if (field == 'disciplina') {
      return alocacao.periodoDisciplina.disciplina.nome;
    }
    if (field == 'professor') {
      return alocacao.professor.nome;
    }
    if (field == 'local') {
      return alocacao.local.nome;
    }
    if (field == 'periodo') {
      if (alocacao.periodoDisciplina.periodo) {
        return datePipe.transform(alocacao.periodoDisciplina.periodo.dataInicio, 'dd/MM/yyyy') + ' - ' + datePipe.transform(alocacao.periodoDisciplina.periodo.dataFim, 'dd/MM/yyyy');
      }
    }
    if (field == 'horario') {
      return alocacao.horario.horaInicio + 'min - ' + alocacao.horario.horaFim + 'min';
    }
    if (field == 'dataAula') {
      return datePipe.transform(alocacao.dataAula, 'dd/MM/yyyy');
    }
    if (field == 'turma') {
      return alocacao.turma;
    }
    if (field == 'alunos') {
      return alocacao.periodoDisciplina.alunos.map((aluno: Aluno) => aluno.nome).join(', ');
    }

    return '';
  }

  formatarDiferenca(valorAnterior: any, valorAtual: any): any {
    if (valorAnterior !== valorAtual && valorAnterior !== undefined) {
      return `${valorAnterior} -> ${valorAtual}`;
    }
    return valorAtual;
  }
}
