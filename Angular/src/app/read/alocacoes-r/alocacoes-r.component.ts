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
import { Alocacao } from '../../models/alocacao.models';
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
    DisciplinaService
  ]
})
export class AlocacoesRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  @ViewChild('multiselect') multiselect!: MultiSelect;
  @ViewChild('dropdownDisc') dropdownDisc!: Dropdown;
  @ViewChild('dropdownPeriodo') dropdownPeriodo!: Dropdown;
  @ViewChild('dropdownLocal') dropdownLocal!: Dropdown;
  @ViewChild('dropdownProf') dropdownProf!: Dropdown;
  @ViewChild('switch') switch!: InputSwitch;
  
  @ViewChild('calendarExtra') calendarExtra!: Calendar;
  @ViewChild('dropdownExtra') dropdownExtra!: Dropdown;
  @ViewChild('calendario') calendario!: Calendar;
  
  @ViewChild('calendarEdit') calendarEdit!: Calendar;
  @ViewChild('multiselectEdit') multiselectEdit!: MultiSelect;
  @ViewChild('dropdownDiscEdit') dropdownDiscEdit!: Dropdown;
  @ViewChild('dropdownPeriodoEdit') dropdownPeriodoEdit!: Dropdown;
  @ViewChild('dropdownLocalEdit') dropdownLocalEdit!: Dropdown;
  @ViewChild('dropdownProfEdit') dropdownProfEdit!: Dropdown;
  @ViewChild('dropdownSemanaEdit') dropdownSemanaEdit!: Dropdown;

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

  selectedAlunos: Aluno[] = [];
  
  visibleExtra: boolean = false;
  visibleEdit: boolean = false;
  visibleInfo: boolean = false;
  
  valor: boolean = false;
  opcaoSemana: Semana[] = [];
  selectedSemana!: Semana;
  diasIntervalo: Date[] = [];
  dataFim!: Date;

  disableDrop: boolean = true;
  disableSwit: boolean = true;

  dtAulaCalendar!: Date;

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
        numAulas: [null, [Validators.required]],
        horaInicio: [null, [Validators.required]],
        horaFinal: [null, [Validators.required]],
        turma: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        diaSemana: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
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
  }

  validarDatas() {
    const dataAula = this.form.get('dataAula')?.value;

    if (dataAula && this.dataFim && new Date(this.dataFim) < new Date(dataAula)) {
      this.form.get('dataAula')?.setErrors({ 'invalidEndDate': true });
    } else {
      this.form.get('dataAula')?.setErrors(null);
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

  verificarHoraFimMaiorQueInicio(formGroup: FormGroup) {
    const horaInicio = formGroup.get('horaInicio')?.value;
    const horaFim = formGroup.get('horaFinal')?.value;

    if (horaInicio && horaFim && horaInicio >= horaFim) {
      formGroup.get('horaFinal')?.setErrors({ 'horaFimMenorQueInicio': true });
    } else {
      formGroup.get('horaFinal')?.setErrors(null);
    }
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
      numAulas: value.numAulas,
      horaInicio: value.horaInicio,
      horaFinal: value.horaFinal,
      turma: value.turma,
      diaSemana: value.diaSemana,
      dataAula: value.dataAula,
      local: value.local,
      disciplina: value.disciplina,
      periodo: value.periodo,
      professor: value.professor,
      alunos: value.alunos,
    })

    const eventoData = this.formatarDtStrDt(dtEv);
    this.calendarEdit.writeValue(eventoData);
    
    this.dropdownDiscEdit.writeValue(value.disciplina);
    this.dropdownPeriodoEdit.writeValue(value.periodo);
    this.dropdownLocalEdit.writeValue(value.local);
    this.dropdownProfEdit.writeValue(value.professor);

    this.multiselectEdit.writeValue(value.alunos);
    this.selectedAlunos = value.alunos;
    value.alunos.forEach(aln => {
      this.addAluno(aln);
    })
    
    const writeEdit = this.opcaoSemana.find(ops => ops.nome == value.diaSemana);
    if (writeEdit) {
      this.dropdownSemanaEdit.writeValue(writeEdit);
    }
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Alocação';
    this.visible = true;
    this.visibleInfo = false;
    this.cadastrar = true;
    this.editar = false;
    this.switch.writeValue(null);
    this.multiselect.writeValue(null);
    this.getAluno().clear();
    this.selectedAlunos = [];
  }
  
  hideDialog() {
    if(this.cadastrar) {
      if(this.visibleExtra) {
        this.visibleExtra = false;
        this.valor = false;
      }
      this.visible = false;
      this.form.reset();
      this.switch.writeValue(null);
    } else if(this.editar) {
      this.visibleEdit = false;
      this.form.reset();
    }
  }
  
  handleChange() {
    if (this.valor) {
      this.visibleExtra = true;
    } else {
      this.visibleExtra = false;
    }
  }
  
  onClickHide() {
    if(this.visibleExtra) this.visibleExtra = false;
  }

  onDropdownChange() {
    let ini: Date = this.form.get('dataAula')?.value;

    if(ini && this.dataFim) {
      this.disableDrop = false;
      this.atualizarDiasSemana(this.selectedSemana.code);
      this.form.patchValue({
        diaSemana: this.selectedSemana.nome
      })
    } else {
      this.disableDrop = true;
    }
  }
  
  onDateIniSelect() {
    let ini: Date = this.form.get('dataAula')?.value;
    
    if(ini) {
      this.disableSwit = false;
      this.calendarExtra.writeValue(ini);
      this.dataFim = ini;
    } else {
      this.disableSwit = true;
      this.calendarExtra.writeValue(null);
    }
  }

  atualizarDiasSemana(code: number) {
    let ini: Date = this.form.get('dataAula')?.value;
    let fim: Date = this.dataFim;

    if(ini && fim) {
      this.diasIntervalo = this.calcularDiasSemana(ini, fim, code);
      this.calendario.writeValue(this.diasIntervalo);
    }
  }

  calcularDiasSemana(dtIni: Date, dtFim: Date, diaSemana: number): Date[] {
    let diasSemana: Date[] = [];
    let dataTemp = new Date(dtIni);

    dataTemp.setDate(dataTemp.getDate() + (diaSemana - dataTemp.getDay() + 7) % 7);

    while (dataTemp <= dtFim) {
      if (dataTemp >= dtIni && dataTemp <= dtFim) {
        diasSemana.push(new Date(dataTemp));
      }
      dataTemp.setDate(dataTemp.getDate() + 7);
    }

    if (!diasSemana.some(dia => dia.getTime() === dtIni.getTime())) {
      diasSemana.push(new Date(dtIni));
    }
    if (!diasSemana.some(dia => dia.getTime() === dtFim.getTime())) {
      diasSemana.push(new Date(dtFim));
    }

    return diasSemana;
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

  searchFilter2(term: string) {
    this.alocacoesData = this.alocacoesFilter.filter(aloca => {
      if (aloca.diaSemana.toLowerCase().includes(term.toLowerCase())) {
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
        const compB = this.formatarTmStrTm(aloca.horaInicio);
        if(compB != null) {
          if (compA == compB) {
            return aloca;
          } else {
            return null;
          }
        } else {
          return null;
        }
      })
    } else {
      return null;
    }
    return null;
  }

  searchFilter8(term: string) {
    this.alocacoesData = this.alocacoesFilter.filter(aloca => {
      const searchTermAsNumber = parseInt(term);
      if (!isNaN(searchTermAsNumber)) {
        const numb = aloca.numAulas;
        if (numb === searchTermAsNumber) {
            return aloca;
        } else {
          return null;
        }
      } else {
        return null;
      }
    });
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
          if(this.selectedFilter.id == 2) this.searchFilter2(searchTerm);
          if(this.selectedFilter.id == 3) this.searchFilter3(searchTerm);
          if(this.selectedFilter.id == 4) this.searchFilter4(searchTerm);
          if(this.selectedFilter.id == 5) this.searchFilter5(searchTerm);
          if(this.selectedFilter.id == 6) this.searchFilter6(searchTerm);
          if(this.selectedFilter.id == 7) this.searchFilter7(searchTerm);
          if(this.selectedFilter.id == 8) this.searchFilter8(searchTerm);
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
        if(this.selectedFilter.id == 2) this.searchFilter2(searchTerm);
        if(this.selectedFilter.id == 3) this.searchFilter3(searchTerm);
        if(this.selectedFilter.id == 4) this.searchFilter4(searchTerm);
        if(this.selectedFilter.id == 5) this.searchFilter5(searchTerm);
        if(this.selectedFilter.id == 6) this.searchFilter6(searchTerm);
        if(this.selectedFilter.id == 7) this.searchFilter7(searchTerm);
        if(this.selectedFilter.id == 8) this.searchFilter8(searchTerm);
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
      const segundos = partes[2];

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

  calcularDiaSemana() {
    const dataSelecionada: Date = this.dtAulaCalendar;
    const diaDaSemana: string = this.calcularNomeDiaSemana(dataSelecionada);
    this.form.patchValue({
      dataAula: dataSelecionada,
      diaSemana: diaDaSemana
    });
    const writeEdit = this.opcaoSemana.find(ops => ops.nome == diaDaSemana);
    this.dropdownSemanaEdit.writeValue(writeEdit);
  }

  calcularNomeDiaSemana(data: Date): string {
      const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const numeroDiaSemana = data.getDay();
      return diasDaSemana[numeroDiaSemana];
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
    if (this.form.valid && this.cadastrar && this.valor) {
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

  conditionCreateSave() {
    const ini: Date = this.form.get('dataAula')?.value;

    if(this.diasIntervalo) {
      //  DATA INÍCIO
      this.alocacoesCadast = this.form.value;
      this.enviarFormSave();
      
      //  DATAS INTERVALO
      // this.formatarDtIntervalo();
      this.diasIntervalo.forEach((dt: Date) => {
        console.log('dt ini ', dt?.getTime() != ini?.getTime())
        console.log('dt fim ', dt?.getTime() != this.dataFim?.getTime())
        if(dt?.getTime() != ini?.getTime() && dt?.getTime() != this.dataFim?.getTime()) {
          this.form.patchValue({
            dataAula: dt
          });
          console.log('intv form ',this.form.value)
          this.alocacoesCadast = this.form.value;
          this.enviarFormSave();
        }
      });

      // DATA FIM
      this.form.patchValue({
        dataAula: this.dataFim,
      });
      this.mss = true;
      this.alocacoesCadast = this.form.value;
      this.enviarFormSave();
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha os campos!', life: 3000 },
      ];
    }
  }

  formatarDtIntervalo() {
    const ini: Date = this.form.get('dataAula')?.value;
    const fim: Date = this.dataFim;

    if (typeof ini === 'string' && typeof fim === 'string') {
      const iniFormat = this.formatarDtStrDt(ini);
      const fimFormat = this.formatarDtStrDt(fim);
      if ((iniFormat instanceof Date && !isNaN(iniFormat.getTime())) && (fimFormat instanceof Date && !isNaN(fimFormat.getTime()))) {
        
        this.diasIntervalo.forEach((dt: Date) => {
          const tiparDT = dt;
          if (typeof tiparDT === 'string') {
            const tiparFormat = this.formatarDatas(tiparDT);
            const dtFormat = this.formatarDtStrDt(tiparFormat);
            
            if(dtFormat?.getTime() != iniFormat.getTime() && dtFormat?.getTime() != fimFormat.getTime()) {
              this.form.patchValue({
                dataAula: dt
              });
              this.alocacoesCadast = this.form.value;
              this.enviarFormSave();
            }
          }
        });
      }
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
