import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PeriodoService } from '../../service/periodo.service';
import { PerDiscMultiSelect, Periodo, PeriodoDisciplina } from '../../models/postgres/periodo.models';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { DisciplinaService } from '../../service/disciplina.service';
import { AlunoService } from '../../service/aluno.service';
import { Disciplina } from '../../models/postgres/disciplina.models';
import { Aluno } from '../../models/postgres/aluno.models';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { MultiSelect } from 'primeng/multiselect';
import { Calendar } from 'primeng/calendar';
import { Page } from '../../models/share/page.models';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-periodos-r',
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
  templateUrl: './periodos-r.component.html',
  styleUrl: './periodos-r.component.scss',
  providers: [
    PeriodoService,
    ConfirmationService,
    MessageService,
    DisciplinaService,
    AlunoService,
    provideNgxMask()
  ]
})
export class PeriodosRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  @ViewChild('multiselectDiscp') multiselectDiscp!: MultiSelect;
  @ViewChild('calendarIni') calendarIni!: Calendar;
  @ViewChild('calendarFim') calendarFim!: Calendar;

  periodosData: Periodo[] = [];
  periodosFilter: Periodo[] = [];
  periodosCadast: Periodo[] = [];
  periodosEdit: Periodo[] = [];

  periodoInfo!: Periodo;
  visibleInfo: boolean = false;

  unsubscribe$!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;
  
  messages!: Message[];
  mss: boolean = false;
  
  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;
  txtFilter: string = 'Pesquisar período';
  
  minDate!: Date;

  minAno!: number;
  maxAno!: number;
  
  unsubscribe$Aln!: Subscription;
  unsubscribe$Disc!: Subscription;
  
  alunosArray: Aluno[] = [];
  disciplinasArray: Disciplina[] = [];
  previousDiscPer: PeriodoDisciplina[] = [];
  
  selectedDisciplinas: Disciplina[]=[];
  selectedDiscAlunos: PerDiscMultiSelect[] = [];
  selectedAlunos: Aluno[][] = [];
  
  minCalend!: Date;
  maxCalend!: Date;
  
  firstPerds: number = 0;
  pagePerds: number = 0;
  rowsPerds: number = 10;
  sizePerds: number = 0;

  sizePerdsTemp: number = 0;

  periodosPageData!: Page<Periodo>;
  alunosPageData!: Page<Aluno>;
  disciplinasPageData!: Page<Disciplina>;

  constructor(
    private periodService: PeriodoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private disciService: DisciplinaService,
    private alunService: AlunoService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        ano: [null, [Validators.required]],
        semestre: [null, [Validators.required]],
        dataInicio: [null, [Validators.required]],
        dataFim: [null, [Validators.required]],
        periodoDisciplinas: this.formBuilder.array([], [Validators.required])
      }, { validator: this.validarDatas });

      const date = new Date();
      this.minAno = date.getFullYear() - 10;
      this.maxAno = date.getFullYear() + 5;
  }

  ngOnInit() {

    this.filterOptions = [
      {nome: 'Data de Início', id: 0},
      {nome: 'Ano', id: 1}
    ];

    this.unsubscribe$ = this.periodService.listar(0,10)
    .subscribe({
      next: (itens:any) => {
        this.periodosPageData = itens;
        this.sizePerds = this.periodosPageData.totalElements;
        
        this.periodosData = this.periodosPageData.content;
        this.periodosData.sort((a: Periodo, b: Periodo) => {
          const dateA = new Date(a.dataInicio);
          const dateB = new Date(b.dataInicio);
          return dateB.getTime() - dateA.getTime();
        });
        this.pageFilter()
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de períodos não encontrados.', life: 3000 },
        ];
      }
    });
    
    this.unsubscribe$Disc = this.disciService.listar(0,10)
    .subscribe({
      next: (itens:any) => {
        this.disciplinasPageData = itens
        this.listarPageObj(2)
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de disciplinas não encontrados.', life: 3000 },
        ];
      }
    });

    this.unsubscribe$Aln = this.alunService.listar(0,10)
    .subscribe({
      next: (itens:any) => {
        this.alunosPageData = itens
        this.listarPageObj(1)
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de alunos não encontrados.', life: 3000 },
        ];
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
    this.unsubscribe$Aln.unsubscribe();
    this.unsubscribe$Disc.unsubscribe();
  }
  
  onPageChange(event: PaginatorState) {
    if (event.first !== undefined && event.rows !== undefined && event.page !== undefined) {
      this.firstPerds = event.first;
      this.rowsPerds = event.rows;
      this.pagePerds = event.page;
      this.listarPage()
    }
  }

  listarPage() {
    this.periodService.listar(this.pagePerds, this.rowsPerds)
    .subscribe((itens:any) => {
        this.periodosPageData = itens;
        this.periodosData = this.periodosPageData.content;
        this.periodosData.sort((a: Periodo, b: Periodo) => {
          const dateA = new Date(a.dataInicio);
          const dateB = new Date(b.dataInicio);
          return dateB.getTime() - dateA.getTime();
        });
      });
  }

  listarPageObj(object: number) {
    if(object == 1) {
      let sizeUm = this.alunosPageData.totalElements
      if(sizeUm > 0) {
        this.alunService.listar(0,sizeUm).subscribe(alno => this.alunosArray = alno.content)
        this.alunosArray.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1)
      }
    } else if(object == 2) {
      let sizeDois = this.disciplinasPageData.totalElements
      if(sizeDois > 0) {
        this.disciService.listar(0,sizeDois).subscribe(discp => this.disciplinasArray = discp.content)
        this.disciplinasArray.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1)
      }
    }
  }  

  pageFilter() {
    if(this.sizePerds > 0) {
      this.periodService.listar(0, this.sizePerds).subscribe(perds => this.periodosFilter = perds.content)
    }
  }

  updateCalendarMinMaxCalend() {
    // let anoInput = this.form.get('ano')?.value;
    let anoInput = parseInt(this.form.get('ano')?.value);
    
    if(!isNaN(anoInput)) {
      this.minCalend = new Date(anoInput, 0, 1);
      this.maxCalend = new Date(anoInput, 11, 31);
      this.form.patchValue({
        dataInicio: this.minCalend,
        dataFim: this.minCalend
      })
      this.calendarIni.writeValue(this.minCalend)
      this.calendarFim.writeValue(this.minCalend)
    }
  }

  getDisciplina(): FormArray {
    return this.form.get('periodoDisciplinas') as FormArray;
  }

  addDiscp(discp: PeriodoDisciplina) {
    this.getDisciplina().push(new FormControl(discp));
  }

  onSelectDisciplinas() {
    if(this.selectedDisciplinas.length <= 0) {
      this.clearSelect();
    } else if(this.selectedDisciplinas.length > 0 && this.selectedDiscAlunos.length > 0) {
      this.verificarGetDiscp();

      let removedIndexes = [];
      
      for (let i = 0; i < this.selectedDiscAlunos.length; i++) {
        const item = this.selectedDiscAlunos[i];
        if (!this.selectedDisciplinas.some(e => e.id === item.disciplina?.id)) {
          removedIndexes.push(i);
        }
      }

      for (let i = removedIndexes.length - 1; i >= 0; i--) {
        const index = removedIndexes[i];
        this.selectedDiscAlunos.splice(index, 1);
        this.selectedAlunos.splice(index, 1);
        this.getDisciplina().removeAt(index);
      }
    }
  }

  pushGetDiscpVazio(disciplina: Disciplina, alunos: Array<Aluno>) {
    const tempDiscp: PeriodoDisciplina = {
      id: null,
      periodo: null,
      disciplina: disciplina,
      alunos: alunos
    };
    this.addDiscp(tempDiscp);
  }

  pushGetDiscpId(disciplina: Disciplina, alunos: Array<Aluno>, index: number, id: number | null, periodo: Periodo | null) {
    this.getDisciplina().at(index).patchValue({
      id: id,
      periodo: periodo,
      disciplina: disciplina,
      alunos: alunos
    });
  }

  adicionarDisciplinaComAlunos(disciplina: Disciplina, alunos: Array<Aluno>) {
    this.verificarGetDiscp();
    
    const index = this.selectedDiscAlunos.findIndex(item => item.disciplina?.id === disciplina.id);
    if (index === -1) {
      this.selectedDiscAlunos.push({ disciplina, alunos });
      this.pushGetDiscpVazio(disciplina, alunos);
    } else {
      this.selectedDiscAlunos[index].disciplina = disciplina;
      this.selectedDiscAlunos[index].alunos = alunos;
      if(this.getDisciplina().length <= 0){
        this.pushGetDiscpVazio(disciplina, alunos);
      } else {
        this.pushGetDiscpId(disciplina, alunos, index, null, null);
      }
    }
  }

  adicionarDisciplinaComAlunosEdit(disciplina: Disciplina, alunos: Array<Aluno>) {
    let idPrevious: number | null = null;
    let idPreviousDiscp: number | undefined = undefined;
    let periodoPrevious: Periodo | null = null;
    this.verificarGetDiscp();

    const previousIndex = this.previousDiscPer.findIndex(item => item.disciplina?.id === disciplina.id);
    if (previousIndex !== -1) {
      idPrevious = this.previousDiscPer[previousIndex].id;
      idPreviousDiscp = this.previousDiscPer[previousIndex].disciplina?.id;
      periodoPrevious = this.previousDiscPer[previousIndex].periodo;
    }
    
    const index = this.selectedDiscAlunos.findIndex(item => item.disciplina?.id === disciplina.id);
    if (index === -1 || (index === -1 && disciplina.id != idPreviousDiscp)) {
      this.selectedDiscAlunos.push({ disciplina, alunos });
      this.pushGetDiscpVazio(disciplina, alunos);
    } else if((index !== -1) || (disciplina.id == idPreviousDiscp)) {
      this.selectedDiscAlunos[index].disciplina = disciplina;
      this.selectedDiscAlunos[index].alunos = alunos;
      if(this.getDisciplina().length <= 0){
        this.pushGetDiscpVazio(disciplina, alunos);
      } else {
        this.pushGetDiscpId(disciplina, alunos, index, idPrevious, periodoPrevious);
      }
    }
  }

  onMinDate() {
    let ini: Date = this.form.get('dataInicio')?.value;

    this.minDate = new Date(ini);
    this.minDate.setDate(this.minDate.getDate() + 1);
    this.minDate.setMonth(this.minDate.getMonth());
    this.minDate.setFullYear(this.minDate.getFullYear());
  }

  setMinDate() {
    const today = new Date();
    const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
    this.minDate = fiveYearsAgo;
  }

  validarDatas(formGroup: FormGroup) {
    const dataInicio = formGroup.get('dataInicio')?.value;
    const dataFim = formGroup.get('dataFim')?.value;

    if (dataInicio && dataFim && new Date(dataFim) < new Date(dataInicio)) {
      formGroup.get('dataFim')?.setErrors({ 'invalidEndDate': true });
    } else {
      formGroup.get('dataFim')?.setErrors(null);
    }
  }

  showEditDialog(value: Periodo, dtIni: string, dtFim: string) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Período'
    this.visible = true;
    this.visibleInfo = false;
    this.cadastrar = false;
    this.editar = true;
    this.form.patchValue({
      id: value.id,
      ano: value.ano,
      semestre: value.semestre,
      dataInicio: value.dataInicio,
      dataFim: value.dataFim,
      periodoDisciplinas: value.periodoDisciplinas
    })
    const perIni = this.formatarDtStrDt(dtIni);
    this.calendarIni.writeValue(perIni);
    const perFim = this.formatarDtStrDt(dtFim);
    this.calendarFim.writeValue(perFim);
    this.onMinDate()

    value.periodoDisciplinas
    .filter(le => {
      if(le.disciplina !== null && le.alunos !== null && le.periodo !== null) {
        this.selectedDisciplinas.push(le.disciplina);
        this.selectedAlunos.push(le.alunos);
        this.selectedDiscAlunos.push({disciplina: le.disciplina, alunos: le.alunos })
        
        const tempDiscp: PeriodoDisciplina = {
          id: le.id,
          periodo: value,
          disciplina: le.disciplina,
          alunos: le.alunos
        };
        this.addDiscp(tempDiscp);
      }
    })
    
    this.previousDiscPer = value.periodoDisciplinas;
    this.multiselectDiscp.writeValue(value.periodoDisciplinas.map(le => le.disciplina));
  }

  showInfoDialog(value: Periodo) {
    this.visibleInfo = true;
    this.periodoInfo = value;
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Período';
    this.visible = true;
    this.visibleInfo = false;
    this.cadastrar = true;
    this.editar = false;
    this.setMinDate();
  }
  
  hideDialog() {
    this.visible = false;
    this.form.reset();
  }
  
  limparFilter(){
    const inputElement = this.inputSearch.nativeElement.value
    if (inputElement) {
      this.inputSearch.nativeElement.value = '';
    }
    this.selectedFilter = {} as FiltrarPesquisa;
    
    this.periodService.listar(0, 10).subscribe(alno => {
      this.periodosData = alno.content;

      this.firstPerds = 0
      this.sizePerds = this.sizePerdsTemp
      this.rowsPerds = 10
    });
  }

  searchFilter0(term: string) {
    this.periodService.acharDia(0, 10, term).subscribe(alno => {
      this.periodosFilter = alno.content
      this.periodosData = this.periodosFilter
      this.sizePerdsTemp = this.sizePerds
      this.sizePerds = alno.totalElements
    })
  }

  searchFilter1(term: string) {
    const searchTermAsNumber = parseInt(term);
    if (!isNaN(searchTermAsNumber)) {
      this.periodService.acharAno(0, 10, searchTermAsNumber).subscribe(alno => {
        this.periodosFilter = alno.content
        this.periodosData = this.periodosFilter
        this.sizePerdsTemp = this.sizePerds
        this.sizePerds = alno.totalElements
      })
    } else {
      this.periodosData = []
    }
  }

  onKeyDown(event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      this.filterField(searchTerm);
    }
  }
  
  filterField(searchTerm: string) {
    if (searchTerm && (searchTerm != null || searchTerm != '')) {
      if(this.selectedFilter) {
        if(this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
        if(this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
      } else {
        this.messages = [
          { severity: 'warn', summary: 'Atenção', detail: 'Selecione um filtro!', life: 3000 },
        ];
      }
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha o campo!', life: 3000 },
      ];
    }
  }

  updateMask() {
    if (this.selectedFilter?.id == 0) {
      this.txtFilter = '00/00/0000';
    } else if (this.selectedFilter?.id == 1) {
      this.txtFilter = '0000';
    } else {
      this.txtFilter = 'Pesquisar período';
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
    this.periodService.criar(this.periodosCadast).subscribe({
      next: (data: any) => {
        this.periodosCadast = data;
        // this.goToRouteSave();
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Perídodo cadastrado com sucesso!', life: 3000 },
        ];
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Cadastro não enviado.', life: 3000 },
        ];
      }
    });
  }

  enviarFormEdit(id: number) {
    this.periodService.atualizar(id, this.periodosEdit).subscribe({
      next: (data: any) => {
        this.periodosEdit = data;
        // this.goToRouteEdit(id);
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Perídodo editado com sucesso!', life: 3000 },
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

    if(this.getDisciplina().length > 0) {
      this.verificarGetDiscp();
      if (this.form.valid && this.cadastrar) {
        this.periodosCadast = this.form.value;
        this.enviarFormSave();
        this.visible = false;
        this.form.reset();
        this.ngOnInit();
        // window.location.reload();
      } else if (this.form.valid && this.editar) {
        this.periodosEdit = this.form.value;
        this.enviarFormEdit(this.form.get('id')?.value);
        this.visible = false;
        this.form.reset();
        this.ngOnInit();
        // window.location.reload();
      } else {
        this.messages = [
          { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha os campos!', life: 3000 },
        ];
      }
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha os campos!', life: 3000 },
      ];
    }
  }

  clearSelect() {
    this.selectedDisciplinas = [];
    this.selectedAlunos = [];
    this.selectedDiscAlunos = [];
    this.getDisciplina().clear();
  }

  verificarGetDiscp() {
    for (let i = this.getDisciplina().length - 1; i >= 0; i--) {
      if (this.getDisciplina().at(i).value === null) {
        this.getDisciplina().removeAt(i);
      }
    }
  }

  deletarID(id: number) {
    this.periodService.excluir(id)
    .subscribe({
      next: (data: any) => {
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Registro deletado com sucesso!', life: 3000 },
        ];
        this.ngOnInit();
        // window.location.reload();
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

