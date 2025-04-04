import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Disciplina } from '../../models/postgres/disciplina.models';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DisciplinaService } from '../../service/disciplina.service';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { Page } from '../../models/share/page.models';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-disciplinas-r',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PrimeNgImportsModule
  ],
  templateUrl: './disciplinas-r.component.html',
  styleUrl: './disciplinas-r.component.scss',
  providers: [
    DisciplinaService,
    ConfirmationService,
    MessageService,
  ]
})
export class DisciplinasRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;

  disciplinasData: Disciplina[] = [];
  dicisplinasFilter: Disciplina[] = [];
  disciplinasCadast: Disciplina[] = [];
  disciplinasEdit: Disciplina[] = [];

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

  firstDiscp: number = 0;
  pageDiscp: number = 0;
  rowsDiscp: number = 10;
  sizeDiscp: number = 0;

  sizeDiscpTemp: number = 0;

  disciplinasPageData!: Page<Disciplina>;
  
  checkOptionsSelected: Disciplina[] = []

  constructor(
    private disciService: DisciplinaService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService
  ) {
    this.form = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      sigla: [null, [Validators.required, Validators.maxLength(10)]]
    });
  }

  ngOnInit() {
    this.filterOptions = [
      { nome: 'Nome', id: 0 },
      { nome: 'Sigla', id: 1 }
    ];

    this.unsubscribe$ = this.disciService.listar(0, 10)
      .subscribe({
        next: (itens: any) => {
          this.disciplinasPageData = itens;
          this.sizeDiscp = this.disciplinasPageData.totalElements;

          this.disciplinasData = this.disciplinasPageData.content;
          this.disciplinasData.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1);
          this.pageFilter()
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: err, sticky: true },
          ];
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
  }

  onPageChange(event: PaginatorState) {
    if (event.first !== undefined && event.rows !== undefined && event.page !== undefined) {
      this.firstDiscp = event.first;
      this.rowsDiscp = event.rows;
      this.pageDiscp = event.page;
      this.checkOptionsSelected = []
      this.listarPage()
    }
  }

  listarPage() {
    this.disciService.listar(this.pageDiscp, this.rowsDiscp)
      .subscribe((itens: any) => {
        this.disciplinasPageData = itens;
        this.disciplinasData = this.disciplinasPageData.content;
        this.disciplinasData.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1);
      });
  }

  pageFilter() {
    if (this.sizeDiscp > 0) {
      this.disciService.listar(0, this.sizeDiscp).subscribe(discp => this.dicisplinasFilter = discp.content)
    }
  }

  showEditDialog(value: Disciplina) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Disciplina'
    this.visible = true;
    this.cadastrar = false;
    this.editar = true;
    this.form.setValue({
      id: value.id,
      nome: value.nome,
      sigla: value.sigla
    })
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Disciplina';
    this.visible = true;
    this.cadastrar = true;
    this.editar = false;
  }

  hideDialog() {
    this.visible = false;
    this.form.reset();
  }

  limparFilter() {
    const inputElement = this.inputSearch.nativeElement.value
    if (inputElement) {
      this.inputSearch.nativeElement.value = '';
    }
    this.selectedFilter = {} as FiltrarPesquisa;

    this.disciService.listar(0, 10).subscribe(alno => {
      this.disciplinasData = alno.content;

      this.firstDiscp = 0
      this.sizeDiscp = this.sizeDiscpTemp
      this.rowsDiscp = 10
    });
  }

  searchFilterWord0(term: string) {
    this.disciService.acharNome(0, 10, term).subscribe(alno => {
      this.dicisplinasFilter = alno.content
      this.disciplinasData = this.dicisplinasFilter
      this.sizeDiscpTemp = this.sizeDiscp
      this.sizeDiscp = alno.totalElements
    })
  }

  searchFilterWord1(term: string) {
    this.disciService.acharSigla(0, 10, term).subscribe(alno => {
      this.dicisplinasFilter = alno.content
      this.disciplinasData = this.dicisplinasFilter
      this.sizeDiscpTemp = this.sizeDiscp
      this.sizeDiscp = alno.totalElements
    })
  }

  onKeyDown(event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      this.filterField(searchTerm);
    }
  }

  filterField(searchTerm: string) {
    if (searchTerm && (searchTerm != null || searchTerm != '')) {
      if (this.selectedFilter) {
        if (this.selectedFilter.id == 0) this.searchFilterWord0(searchTerm);
        if (this.selectedFilter.id == 1) this.searchFilterWord1(searchTerm);
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

  confirm3(event: Event, codes: Disciplina[]) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Deseja excluir esses registros?',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        codes.forEach(alno => this.deletarID(alno.id));
      },
      reject: () => {
        this.messages = [
          { severity: 'info', summary: 'Cancelado', detail: 'Exclusão cancelada.', life: 3000 },
        ];
      }
    });
  }

  enviarFormSave() {
    this.disciService.criar(this.disciplinasCadast).subscribe({
      next: (data: any) => {
        this.disciplinasCadast = data;
        // this.goToRouteSave();
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Disciplina cadastrada com sucesso!', life: 3000 },
        ];
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: err, sticky: true },
        ];
      }
    });
  }

  enviarFormEdit(id: number) {
    this.disciService.atualizar(id, this.disciplinasEdit).subscribe({
      next: (data: any) => {
        this.disciplinasEdit = data;
        // this.goToRouteEdit(id);
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Disciplina editada com sucesso!', life: 3000 },
        ];
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: err, sticky: true },
        ];
      }
    });
  }

  onSubmit() {
    if (this.form.valid && this.cadastrar) {
      this.disciplinasCadast = this.form.value;
      this.enviarFormSave()
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      // window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.disciplinasEdit = this.form.value;
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
    this.disciService.excluir(id)
      .subscribe({
        next: (data: any) => {
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Registro deletado com sucesso!', life: 3000 },
          ];
          this.ngOnInit();
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: err, sticky: true },
          ];
        }
      });
  }
  

  badgeOptionExclui(event: Event) {
    if(this.checkOptionsSelected.length > 0) {
      this.confirm3(event, this.checkOptionsSelected)
    }
  }

}

