import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ScrollTopModule } from 'primeng/scrolltop';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { MessagesModule } from 'primeng/messages';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { Alocacao, AlocacaoHour } from '../../models/alocacao.models';
import { AlocacaoService } from '../../service/alocacao.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { AlunoService } from '../../service/aluno.service';
import { ProfessorService } from '../../service/professor.service';
import { LocalService } from '../../service/local.service';
import { PeriodoService } from '../../service/periodo.service';
import { DisciplinaService } from '../../service/disciplina.service';
import { Aluno } from '../../models/aluno.models';
import { Professor } from '../../models/professor.models';
import { Local } from '../../models/local.models';
import { Disciplina } from '../../models/disciplina.models';
import { Periodo } from '../../models/periodo.models';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { Semana } from '../../models/share/semana.models';
import { InputSwitch, InputSwitchModule } from 'primeng/inputswitch';
import { registerLocaleData } from '@angular/common';
import localePT from '@angular/common/locales/pt';
import { DiaSemana, Horario } from '../../models/horario.models';
registerLocaleData(localePT);

@Component({
  selector: 'app-alocacoes-r',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TableModule,
    DialogModule,
    PaginatorModule,
    ToastModule,
    ScrollTopModule,
    ConfirmPopupModule,
    CalendarModule,
    MessagesModule,
    OverlayPanelModule,
    InputNumberModule,
    MultiSelectModule,
    DropdownModule,
    InputSwitchModule
  ],
  templateUrl: './alocacoes-r.component.html',
  styleUrl: './alocacoes-r.component.scss',
  providers: [
    AlocacaoService,
    ConfirmationService,
    MessageService,
    AlunoService,
    ProfessorService,
    LocalService,
    PeriodoService,
    DisciplinaService,
  ]
})
export class AlocacoesRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  @ViewChild('multiselect') multiselect!: MultiSelect;
  @ViewChild('dropdownDisc') dropdownDisc!: Dropdown;
  @ViewChild('dropdownPeriodo') dropdownPeriodo!: Dropdown;
  @ViewChild('dropdownLocal') dropdownLocal!: Dropdown;
  @ViewChild('dropdownProf') dropdownProf!: Dropdown;
  @ViewChild('dropdownHora') dropdownHora!: Dropdown;
  @ViewChild('switch') switch!: InputSwitch;
  @ViewChild('calendar') calendar!: Calendar;
  
  @ViewChild('calendarIntervalo') calendarIntervalo!: Calendar;

  alocacoesData: Alocacao[] = [];
  alocacoesFilter: Alocacao[] = [];
  alocacoesCadast: Alocacao[] = [];
  alocacoesEdit: Alocacao[] = [];
  alocacaoInfo!: Alocacao;

  unsubscribe$!: Subscription;
  unsubscribe$Aln!: Subscription;
  unsubscribe$Disc!: Subscription;
  unsubscribe$Prof!: Subscription;
  unsubscribe$Per!: Subscription;
  unsubscribe$Loc!: Subscription;
  unsubscribe$HR!: Subscription;

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
  disciplinasArray: Disciplina[] = [];
  periodosArray: Periodo[] = [];
  alunosArray: Aluno[] = [];
  horariosArray: Horario[] = [];

  selectedAlunos: Aluno[] = [];
  
  visibleExtra: boolean = false;
  visibleEdit: boolean = false;
  visibleInfo: boolean = false;
  
  opcaoSemana: Semana[] = [];
  selectedDiasSemana: Semana[] = [];
  diasIntervalo: Date[] | null = null;
  
  enableDataAula: boolean = false;
  disableDiaSemana: boolean = true;

  minDate!: Date;
  maxDate!: Date;
  alocacaoHour: AlocacaoHour[] = [];

  constructor(
    private alocService: AlocacaoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private alunService: AlunoService,
    private disciService: DisciplinaService,
    private locService: LocalService,
    private periodService: PeriodoService,
    private professorService: ProfessorService,
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        horarioInicio: [null, [Validators.required]],
        horarioFim: [null, [Validators.required]],
        turma: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        dataAula: [null, [Validators.required]],
        local: [null, [Validators.required]],
        disciplina: [null, [Validators.required]],
        periodo: [null, [Validators.required]],
        professor: [null, [Validators.required]],
        alunos: this.formBuilder.array([], [Validators.required]),
      }, { validator: this.verificarHoraFimMaiorQueInicio });
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
      {nome: 'Data da aula', id: 0},
      {nome: 'Turma', id: 1},
      {nome: 'Dia da semana', id: 2},
      {nome: 'Nome da Disciplina', id: 3},
      {nome: 'Nome do Local', id: 4},
      {nome: 'Nome do Professor', id: 5},
      {nome: 'Nome do Aluno', id: 6},
      {nome: 'Hora de início', id: 7},
      {nome: 'Número de aulas', id: 8},
      {nome: 'Ano da aula', id: 9}
    ];

    this.unsubscribe$ = this.alocService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        
        data.sort((a: Alocacao, b: Alocacao) => {
          const dateA = new Date(a.dataAula);
          const dateB = new Date(b.dataAula);
          return dateB.getTime() - dateA.getTime();
        });
        
        this.alocacoesData = data;
        this.alocacoesFilter = this.alocacoesData;
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de alocações não encontrados.', life: 3000 },
        ];
      }
    });
    
    this.unsubscribe$Aln = this.alunService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.alunosArray = data.sort((a:any, b:any) => (a.nome < b.nome ) ? -1 : 1);
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de alunos não encontrados.', life: 3000 },
        ];
      }
    });
    
    this.unsubscribe$Disc = this.disciService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.disciplinasArray = data.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de disciplinas não encontrados.', life: 3000 },
        ];
      }
    });
    
    this.unsubscribe$Loc = this.locService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.locaisArray = data.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de locais não encontrados.' },
        ];
      }
    });
    
    this.unsubscribe$Per = this.periodService.listar()
    .subscribe({
      next: (itens:any) => {
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
      next: (itens:any) => {
        const data = itens.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
        this.professoresArray = data;
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de professores não encontrados.', life: 3000 },
        ];
      }
    });

  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
    this.unsubscribe$Aln.unsubscribe();
    this.unsubscribe$Disc.unsubscribe();
    this.unsubscribe$Loc.unsubscribe();
    this.unsubscribe$Per.unsubscribe();
    this.unsubscribe$Prof.unsubscribe();
    this.unsubscribe$HR.unsubscribe();
  }
  
  verificarHoraFimMaiorQueInicio(formGroup: FormGroup) {
    const horaInicio = formGroup.get('horarioInicio')?.value;
    const horaFim = formGroup.get('horarioFim')?.value;

    if (horaInicio && horaFim && horaInicio >= horaFim) {
      formGroup.get('horarioFim')?.setErrors({ 'horaFimMenorQueInicio': true });
    } else {
      formGroup.get('horarioFim')?.setErrors(null);
    }
  }

  getAluno(): FormArray {
    return this.form.get('alunos') as FormArray;
  }

  addAluno(aluno: Aluno) {
    this.getAluno().push(new FormControl(aluno));
    // console.log('add => ',this.getAluno())
  }

  onAlunosChange(event: any) {
    this.getAluno().clear();
    // console.log('clear => ',this.getAluno())

    event.value.forEach((aluno: Aluno) => {
      this.addAluno(aluno);
    });
  }

  showInfoDialog(valueInfo: Alocacao) {
    this.visibleInfo = true;
    this.alocacaoInfo = valueInfo;
  }

  showEditDialog(value: Alocacao, dtEv: string) {
    this.form.reset();
    this.getAluno().clear();
    this.ehTitulo = 'Atualizar Alocação'
    this.visibleEdit = true;
    this.visibleInfo = false;
    this.cadastrar = false;
    this.editar = true;
    this.form.patchValue({
      id: value.id,
      horarioInicio: value.horarioInicio,
      horarioFim: value.horarioFim,
      turma: value.turma,
      dataAula: value.dataAula,
      local: value.local,
      disciplina: value.disciplina,
      periodo: value.periodo,
      professor: value.professor,
      alunos: value.alunos,
    })

    const eventoData = this.formatarDtStrDt(dtEv);
    
    this.calendar.writeValue(eventoData);
    this.dropdownDisc.writeValue(value.disciplina);
    this.dropdownPeriodo.writeValue(value.periodo);
    this.dropdownLocal.writeValue(value.local);
    this.dropdownProf.writeValue(value.professor);
    this.multiselect.writeValue(value.alunos);

    this.selectedAlunos = value.alunos;
    value.alunos.forEach(aln => {
      this.addAluno(aln);
    })
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Alocação';
    this.visible = true;
    this.visibleInfo = false;
    this.cadastrar = true;
    this.editar = false;
    this.switch.writeValue(null);
    this.getAluno().clear();
    this.selectedAlunos = [];
  }
  
  hideDialog() {
    if(this.cadastrar) {
      if(this.visibleExtra) {
        this.visibleExtra = false;
      }
      this.visible = false;
      this.form.reset();
      this.switch.writeValue(null);
    } else if(this.editar) {
      this.visibleEdit = false;
      this.form.reset();
    }
  }
  
  onClickHide() {
    if(this.visibleExtra) this.visibleExtra = false;
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
    let periodo: Periodo = this.form.get('periodo')?.value;

    if(ini && periodo) {
      const periodoFim = new Date(periodo.dataFim);
      this.diasIntervalo = this.calcularDiasSemana(ini, periodoFim, codes);
      this.calendarIntervalo.writeValue(this.diasIntervalo);
    }
  }

  onMultiselectChange() {
    let ini: Date = this.form.get('dataAula')?.value;
    let periodo: Periodo = this.form.get('periodo')?.value;

    if(ini && this.selectedDiasSemana && periodo) {
      let codes: number[] = this.selectedDiasSemana.map(selD => selD.code);
      this.selectedDiasSemana.forEach(selD => {
        const existe = this.alocacaoHour.some(item => item.diaSemana === selD);
        if (!existe) {
          this.alocacaoHour.push({
            diaSemana:selD, horaFinal:{hours:0,minutes:0}, horaInicio: {hours:0,minutes:0}
          })
        }
      })
      this.alocacaoHour = this.alocacaoHour.filter(item => this.selectedDiasSemana?.includes(item.diaSemana));
      
      this.atualizarDiasSemana(codes);
      
      const periodoFim = new Date(periodo.dataFim);
      this.minDate = new Date(ini);
      this.minDate.setDate(ini.getDate() + 1);
      this.minDate.setMonth(ini.getMonth());
      this.minDate.setFullYear(ini.getFullYear());
      
      this.maxDate = new Date(periodoFim);
      this.maxDate.setDate(periodoFim.getDate());
      this.maxDate.setMonth(periodoFim.getMonth());
      this.maxDate.setFullYear(periodoFim.getFullYear());
    } else {
      this.diasIntervalo = null;
    }
  }

  verificarDataHour() {
    this.diasIntervalo?.sort((a:Date, b:Date) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime();
    });

    this.onMultiselectChange();
  }
  
  onDateIniSelect() {
    const dataAula = this.form.get('dataAula')?.value;
    const periodo: Periodo = this.form.get('periodo')?.value;

    if(dataAula && periodo) {
      const periodoInicio = new Date(periodo.dataInicio);
      const periodoFim = new Date(periodo.dataFim);
      const dataAulaValida = new Date(dataAula) >= periodoInicio && new Date(dataAula) <= periodoFim;
      
      if (dataAulaValida) {
        this.form.get('dataAula')?.setErrors(null);
        this.disableDiaSemana = false;
      } else {
        this.form.get('dataAula')?.setErrors({ 'invalidEndDate': true });
        this.disableDiaSemana = true;
      }
    }
  }

  updateDataAulaState() {
    const periodo: Periodo = this.form.get('periodo')?.value;
    if(periodo) {
      this.enableDataAula = true;
    } else {
      this.enableDataAula = false;
    }
    console.log(this.enableDataAula);
  }
  
  limparFilter(){
    const inputElement = this.inputSearch.nativeElement.value
    if (inputElement) {
      this.inputSearch.nativeElement.value = '';
    }
    this.selectedFilter = {} as FiltrarPesquisa;
    this.alocacoesData = this.alocacoesFilter;
  }

  searchFilter0(term: string) {
    const dateTerm = this.formatarDtStrDt(term);
    
    if (dateTerm instanceof Date && !isNaN(dateTerm.getTime())) {
      this.alocacoesData = this.alocacoesFilter.filter(aloca => {
        const tiparDT = aloca.dataAula;
        if (typeof tiparDT === 'string') {
          const tiparFormat = this.formatarDatas(tiparDT);
          const searchTerm = this.formatarDtStrDt(tiparFormat);
          
          if (dateTerm.getTime() === searchTerm?.getTime()) {
            return aloca;
          } else {
            return null;
          }
        } else {
          return null;
        }
      })
    }
  }

  searchFilter1(term: string) {
    this.alocacoesData = this.alocacoesFilter.filter(aloca => {
      if (aloca.turma.toLowerCase().includes(term.toLowerCase())) {
        return aloca;
      } else {
        return null;
      }
    })
  }

  searchFilter3(term: string) {
    this.alocacoesData = this.alocacoesFilter.filter(aloca => {
      if (aloca.disciplina.nome.toLowerCase().includes(term.toLowerCase())) {
        return aloca;
      } else {
        return null;
      }
    })
  }

  searchFilter4(term: string) {
    this.alocacoesData = this.alocacoesFilter.filter(aloca => {
      if (aloca.local.nome.toLowerCase().includes(term.toLowerCase())) {
        return aloca;
      } else {
        return null;
      }
    })
  }

  searchFilter5(term: string) {
    this.alocacoesData = this.alocacoesFilter.filter(aloca => {
      if (aloca.professor.nome.toLowerCase().includes(term.toLowerCase())) {
        return aloca;
      } else {
        return null;
      }
    })
  }

  searchFilter6(term: string) {
    this.alocacoesData = this.alocacoesFilter.filter(aloca => {
      aloca.alunos.filter(aln => {
        if ( aln.nome.toLowerCase().includes(term.toLowerCase()) ) {
            return aloca;
        } else {
          return null;
        }
      })
    });
  }

  searchFilter7(term: string) {
    const compA = this.formatarTmStrTm(term);
    if(compA != null) {
      this.alocacoesData = this.alocacoesFilter.filter(aloca => {
        const compB = this.formatarTmStrTm(aloca.horarioInicio);
        if(compB != null) {
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

  searchFilter9(term: string) {
    this.alocacoesData = this.alocacoesFilter.filter(aloca => {
      const searchTermAsNumber = parseInt(term);
      if (!isNaN(searchTermAsNumber)) {
        const ano = new Date(aloca.dataAula).getFullYear();
        if (ano === searchTermAsNumber) {
          return aloca;
        } else {
          return null;
        }
      } else {
        return null;
      }
    })
  }

  onKeyDown(event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      if (searchTerm != null || searchTerm != '') {
        if(this.selectedFilter) {
          if(this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
          if(this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
          // if(this.selectedFilter.id == 2) this.searchFilter2(searchTerm);
          if(this.selectedFilter.id == 3) this.searchFilter3(searchTerm);
          if(this.selectedFilter.id == 4) this.searchFilter4(searchTerm);
          if(this.selectedFilter.id == 5) this.searchFilter5(searchTerm);
          if(this.selectedFilter.id == 6) this.searchFilter6(searchTerm);
          if(this.selectedFilter.id == 7) this.searchFilter7(searchTerm);
          // if(this.selectedFilter.id == 8) this.searchFilter8(searchTerm);
          if(this.selectedFilter.id == 9) this.searchFilter9(searchTerm);
        }
      }
    }
  }
  
  filterField(searchTerm: string) {
    if (searchTerm != null || searchTerm != '') {
      if(this.selectedFilter) {
        if(this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
        if(this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
        // if(this.selectedFilter.id == 2) this.searchFilter2(searchTerm);
        if(this.selectedFilter.id == 3) this.searchFilter3(searchTerm);
        if(this.selectedFilter.id == 4) this.searchFilter4(searchTerm);
        if(this.selectedFilter.id == 5) this.searchFilter5(searchTerm);
        if(this.selectedFilter.id == 6) this.searchFilter6(searchTerm);
        if(this.selectedFilter.id == 7) this.searchFilter7(searchTerm);
        // if(this.selectedFilter.id == 8) this.searchFilter8(searchTerm);
        if(this.selectedFilter.id == 9) this.searchFilter9(searchTerm);
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
    if(date) {
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
    if(tempo) {
      const partes = tempo.split(':');
      const horas =  parseInt(partes[0], 10);
      const minutos =  parseInt(partes[1], 10) - 1;
      
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
    if (typeof tempo === 'string') {
      const partes = tempo.split(':');
      const horas = partes[0];
      const minutos = partes[1];

      return `${horas}h ${minutos}min`;
    }
    return null;
  }

  updateMask() {
    if (this.selectedFilter?.id == 0) {
      this.txtFilter = '00/00/0000';
    } else if (this.selectedFilter?.id == 7) {
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
        this.goToRouteSave();
        this.ngOnInit();
        if(this.mss) {
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Alocação cadastrada com sucesso!', life: 3000 },
          ];
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
        this.goToRouteEdit(id);
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

  goToRouteSave() {
    this.router.navigate(['api/alocacoes']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/alocacoes', id]);
  }

  onSubmit() {
      console.log(this.form.value)
    const ini: Date = this.form.get('dataAula')?.value;
    this.alocacaoHour.find(alocH => {
      const diaDaSemana = this.obterDiaDaSemana(ini);
      if(diaDaSemana == alocH.diaSemana.nome) {
        this.form.patchValue({
          horarioInicio: alocH.horaInicio,
          horarioFim: alocH.horaFinal
        });
      }
    })

    if (this.form.valid && this.cadastrar) {
      this.conditionCreateSave();
      this.mss = false;
      this.visible = false;
      this.visibleExtra = false;
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

  conditionCreateSave() {
    const ini: Date = this.form.get('dataAula')?.value;

    if(this.diasIntervalo) {
      //  DATA INÍCIO
        this.alocacoesCadast = this.form.value;
        this.enviarFormSave();
      
      //  DATAS INTERVALO
      this.diasIntervalo.forEach((dt: Date) => {
        if(dt?.getTime() != ini?.getTime()) {
          this.alocacaoHour.find(alocH => {
            const diaDaSemana = this.obterDiaDaSemana(dt);
            if(diaDaSemana == alocH.diaSemana.nome) {
              this.form.patchValue({
                dataAula: dt,
                horarioInicio: alocH.horaInicio,
                horarioFim: alocH.horaFinal
              });
              this.alocacoesCadast = this.form.value;
              this.enviarFormSave();
            }
          })
        }
      });
      this.mss = true;
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

}