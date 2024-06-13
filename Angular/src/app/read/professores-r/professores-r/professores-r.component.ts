import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Professor } from '../../../models/postgres/professor.models';
import { ProfessorService } from '../../../service/professor.service';
import { FiltrarPesquisa } from '../../../models/share/filtrar-pesquisa.models';
import { Coordenadoria } from '../../../models/postgres/coordenadoria.models';
import { CoordenadoriaService } from '../../../service/coordenadoria.service';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { PrimeNgImportsModule } from '../../../shared/prime-ng-imports/prime-ng-imports.module';
import { InputSwitch } from 'primeng/inputswitch';
import { Dropdown } from 'primeng/dropdown';
import { PaginatorState } from 'primeng/paginator';
import { Page } from '../../../models/share/page.models';

@Component({
  selector: 'app-professores-r',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PrimeNgImportsModule
  ],
  templateUrl: './professores-r.component.html',
  styleUrls: ['./professores-r.component.scss'],
  providers: [
    ProfessorService,
    ConfirmationService,
    MessageService,
    CoordenadoriaService
  ]
})

export class ProfessoresRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInputOri') inputSearchOri!: ElementRef;
  @ViewChild('searchInputProf') inputSearchProf!: ElementRef;
  @ViewChild('searchTable2') searchTable2!: ElementRef;
  @ViewChild('searchTable1') searchTable1!: ElementRef;
  @ViewChild('switch') switch!: InputSwitch;
  @ViewChild('dropdown') dropdown!: Dropdown;

  professoresCadast: Professor[] = [];
  professoresEdit!: Professor;
  
  professoresData: Professor[] = [];
  professoresFilterProf: Professor[] = [];

  unsubscribe$!: Subscription;
  unsubscribe$Coord!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;
  switchCooda: boolean = false;
  
  messages!: Message[];
  mss: boolean = false;
  
  filterOptions: FiltrarPesquisa[] = [];
  selectedFilterProf!: FiltrarPesquisa;
  
  professorInfo!: Professor;
  visibleInfo: boolean = false;

  coordenadoriasArray: Coordenadoria[] = [];
  
  firstProfsr: number = 0;
  pageProfsr: number = 0;
  rowsProfsr: number = 10;
  sizeProfsr: number = 0;

  professoresPageData!: Page<Professor>;
  coordenasPageData!: Page<Coordenadoria>;
  checkOptionsSelected: Professor[] = []

  constructor(
    private professorService: ProfessorService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private coordaService: CoordenadoriaService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        matricula: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        sigla: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        ehCoordenador: [false, [Validators.required]],
        coordenadoria: [null],
      });
  }

  ngOnInit() {
    this.filterOptions = [
      {nome: 'Nome', id: 0},
      {nome: 'Sigla', id: 1},
      {nome: 'Matrícula', id: 2},
      {nome: 'Orientadores', id: 3}
    ];

    this.unsubscribe$ = this.professorService.listar(0,10)
    .subscribe({
      next: (itens:any) => {
        this.professoresPageData = itens;
        this.sizeProfsr = this.professoresPageData.totalElements;
        
        this.professoresData = this.professoresPageData.content;
        this.professoresData.sort((a:any, b:any) => (a.nome < b.nome ) ? -1 : 1);
        this.pageFilter()
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de professores não encontrados.', life: 3000 },
        ];
      }
    });
    
    this.unsubscribe$Coord = this.coordaService.listar(0,10)
    .subscribe({
      next: (itens:any) => {
        this.coordenasPageData = itens
        this.listarPageObj()
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de coordenadorias não encontrados.', life: 3000 },
        ];
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
    this.unsubscribe$Coord.unsubscribe();
  }

  
  onPageChange(event: PaginatorState) {
    if (event.first !== undefined && event.rows !== undefined && event.page !== undefined) {
      this.firstProfsr = event.first;
      this.rowsProfsr = event.rows;
      this.pageProfsr = event.page;
      this.checkOptionsSelected = []
      this.listarPage()
    }
  }

  listarPage() {
    this.professorService.listar(this.pageProfsr, this.rowsProfsr)
    .subscribe((itens:any) => {
        this.professoresPageData = itens;
        this.professoresData = this.professoresPageData.content;
        this.professoresData.sort((a:any, b:any) => (a.nome < b.nome ) ? -1 : 1);
      });
  }
  
  listarPageObj() {
    let sizeAll = this.coordenasPageData.totalElements
    if(sizeAll > 0) {
      this.coordaService.listar(0,sizeAll).subscribe(codr => this.coordenadoriasArray = codr.content)
      this.coordenadoriasArray.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1)
    }
  }

  pageFilter() {
    if(this.sizeProfsr > 0) {
      this.professorService.listar(0, this.sizeProfsr).subscribe(prfs => this.professoresFilterProf = prfs.content)
    }
  }

  showInfoDialog(value: Professor) {
    this.visibleInfo = true;
    this.professorInfo = value;
  }

  showEditDialog(value: Professor) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Professor'
    this.visible = true;
    this.visibleInfo = false;
    this.cadastrar = false;
    this.editar = true;
    this.form.setValue({
      id: value.id,
      nome: value.nome,
      matricula: value.matricula,
      sigla: value.sigla,
      ehCoordenador: value.ehCoordenador,
      coordenadoria: value.coordenadoria,
    });
    this.switch.writeValue(value.ehCoordenador);
    if(!value.ehCoordenador) {
      this.dropdown.writeValue(value.coordenadoria)
    }
  }

  showDialog() {
    this.form.reset();
    this.form.patchValue({
      ehCoordenador: false
    });
    this.ehTitulo = 'Cadastrar Professor';
    this.visible = true;
    this.visibleInfo = false;
    this.cadastrar = true;
    this.editar = false;
    this.switch.writeValue(false);
    this.switchCooda = false;
  }
  
  hideDialog() {
    this.visible = false;
    this.form.reset();
    this.switch.writeValue(false);
    this.switchCooda = false;
  }

  patchForm() {
    if(this.switchCooda) {
      this.form.patchValue({
        coordenadoria: null
      })
    }
  }

  limparFilter(){
      const inputElement = this.inputSearchProf.nativeElement.value
      if (inputElement) {
        this.inputSearchProf.nativeElement.value = '';
      }
      this.selectedFilterProf = {} as FiltrarPesquisa;
      this.professoresData = this.professoresFilterProf;
  }

  searchFilter0(term: string) {
      this.professoresData = this.professoresFilterProf.filter(el => {
        if (el.nome.toLowerCase().includes(term.toLowerCase())) {
          return el;
        } else {
          return null;
        }
      })
  }

  searchFilter1(term: string) {
      this.professoresData = this.professoresFilterProf.filter(el => {
        if (el.sigla.toLowerCase().includes(term.toLowerCase())) {
          return el;
        } else {
          return null;
        }
      })
  }

  searchFilter2(term: string) {
      this.professoresData = this.professoresFilterProf.filter(el => {
        if (el.matricula.toString().toLowerCase().includes(term.toLowerCase())) {
          return el;
        } else {
          return null;
        }
      })
  }

  searchFilter3(term: string) {
      this.professoresData = this.professoresFilterProf.filter(el => {
        if(term == null || term == '') {
          if (el.ehCoordenador) {
            return el;
          } else {
            return null;
          }
        } else {
          if (el.ehCoordenador && el.nome.toString().toLowerCase().includes(term.toLowerCase())) {
            return el;
          } else {
            return null;
          }
        }
      })
  }

  onKeyDown(event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      this.filterField(searchTerm);
    }
  }
  
  filterField(searchTerm: string) {
    if(this.selectedFilterProf) {
      if(this.selectedFilterProf.id == 3 && (searchTerm == null || searchTerm == '')) this.searchFilter3(searchTerm);
      else if (searchTerm && (searchTerm != null || searchTerm != '')) {
        if(this.selectedFilterProf.id == 0) this.searchFilter0(searchTerm);
        if(this.selectedFilterProf.id == 1) this.searchFilter1(searchTerm);
        if(this.selectedFilterProf.id == 2) this.searchFilter2(searchTerm);
        if(this.selectedFilterProf.id == 3) this.searchFilter2(searchTerm);
      } else {
        this.messages = [
          { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha o campo!', life: 3000 },
        ];
      }
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Selecione um filtro!', life: 3000 },
      ];
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

  confirm3(event: Event, id: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Deseja excluir esses registros?',
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
    this.professorService.criar(this.professoresCadast).subscribe({
      next: (data: any) => {
        // this.goToRouteSave();
        this.professoresCadast = data;
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Professor cadastrado com sucesso!', life: 3000 },
        ];
        this.ngOnInit();
      },
      error: (err: any) => {
        if (err.status === 400) {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Matrícula já existente!', life: 3000 },
          ];
        } else {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Cadastro não enviado.', life: 3000 },
          ];
        }
      }
    });
  }

  enviarFormEdit(id: number) {
    this.professorService.atualizar(id, this.professoresEdit).subscribe({
      next: (data: any) => {
        this.professoresEdit = data;
        // this.goToRouteEdit(id);
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Professor editado com sucesso!', life: 3000 },
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
    if (this.form.valid && this.cadastrar) {
      this.professoresCadast = this.form.value;
      this.enviarFormSave();
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      // window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.professoresEdit = this.form.value;
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
  }

  deletarID(id: number) {
    this.professorService.excluir(id)
    .subscribe({
      next: (data: any) => {
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Registro deletado com sucesso!', life: 3000 },
        ];
        this.ngOnInit();
        // window.location.reload();
      },
      error: (err: any) => {
        if (err.status === 403) {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Você não tem permissão para deletar este registro associado a alocações.', life: 3000 },
          ];
        } else if (err.status === 401) {
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

  rfidDialogVisible: boolean = false;
  rfidValue: string = '';
  
  openRFIDDialog() {
    this.rfidDialogVisible = true;
    this.rfidValue = '';
}

onRFIDEnter() {
  if (this.rfidValue.length === 10) {
    const matriculaControl = this.form.get('matricula');
    if (matriculaControl) {
      matriculaControl.setValue(this.rfidValue);
    }
    this.rfidDialogVisible = false;
  }
}

  closeRFIDDialog() {
    this.rfidDialogVisible = false;
  }

  badgeOptionExclui(event: Event) {
    if(this.checkOptionsSelected.length > 0) {
      for (const key of this.checkOptionsSelected) {
        this.confirm3(event, key.id)
      }
    }
  }

  badgeOptionGerarCodBarra() {
    if(this.checkOptionsSelected.length > 0) {
      for (const key of this.checkOptionsSelected) {
        // this.generateBarcode(key.matricula)
      }
    }
  }

}
