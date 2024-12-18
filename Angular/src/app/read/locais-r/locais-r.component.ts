import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LocalService } from '../../service/local.service';
import { Local, LocalEquipMultiSelect, LocalEquipamento } from '../../models/postgres/local.models';
import { EquipamentoService } from '../../service/equipamento.service';
import { Equipamento } from '../../models/postgres/equipamento.models';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { MultiSelect } from 'primeng/multiselect';
import { PaginatorState } from 'primeng/paginator';
import { Page } from '../../models/share/page.models';

@Component({
  selector: 'app-locais-r',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PrimeNgImportsModule
  ],
  templateUrl: './locais-r.component.html',
  styleUrl: './locais-r.component.scss',
  providers: [
    LocalService,
    EquipamentoService,
    ConfirmationService,
    MessageService,
  ]
})
export class LocaisRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  @ViewChild('multiselect') multiselect!: MultiSelect;

  locaisData: Local[] = [];
  locaisFilter: Local[] = [];
  locaisCadast!: Local;
  locaisEdit!: Local;
  localCadEdit!: Local;

  equipamentosData: Equipamento[] = [];
  previousEquipLocal: LocalEquipamento[] = [];

  selectedEquipamentos: Equipamento[] = [];
  selectedEquipQtd: LocalEquipMultiSelect[] = [];
  selectedQtd: number[] = [];

  unsubscribe$!: Subscription;
  unsubscribe$EQ!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;

  localInfo!: Local;
  visibleInfo: boolean = false;

  messages!: Message[];
  mss: boolean = false;

  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;

  firstLocs: number = 0;
  pageLocs: number = 0;
  rowsLocs: number = 10;
  sizeLocs: number = 0;

  sizeLocsTemp: number = 0;

  locaisPageData!: Page<Local>;
  equipamentosPageData!: Page<Equipamento>;
  
  checkOptionsSelected: Local[] = []

  constructor(
    private locService: LocalService,
    private equipService: EquipamentoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService
  ) {
    this.form = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      capacidade: [null, [Validators.required]],
      localEquipamentos: this.formBuilder.array([], [Validators.required])
    });
  }

  ngOnInit() {
    this.filterOptions = [
      { nome: 'Nome do local', id: 0 },
      { nome: 'Capacidade', id: 1 }
    ];

    this.unsubscribe$ = this.locService.listar(0, 10)
      .subscribe({
        next: (itens: any) => {
          this.locaisPageData = itens;
          this.sizeLocs = this.locaisPageData.totalElements;

          this.locaisData = this.locaisPageData.content;
          this.locaisData.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1);
          this.pageFilter()
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: err, sticky: true },
          ];
        }
      });

    this.unsubscribe$EQ = this.equipService.listar(0, 10)
      .subscribe({
        next: (itens: any) => {
          this.equipamentosPageData = itens
          this.listarPageObj()
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
    this.unsubscribe$EQ.unsubscribe();
  }

  onPageChange(event: PaginatorState) {
    if (event.first !== undefined && event.rows !== undefined && event.page !== undefined) {
      this.firstLocs = event.first;
      this.rowsLocs = event.rows;
      this.pageLocs = event.page;
      this.checkOptionsSelected = []
      this.listarPage()
    }
  }

  listarPage() {
    this.locService.listar(this.pageLocs, this.rowsLocs)
      .subscribe((itens: any) => {
        this.locaisPageData = itens;
        this.locaisData = this.locaisPageData.content;
        this.locaisData.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1);
      });
  }

  listarPageObj() {
    let sizeAll = this.equipamentosPageData.totalElements
    if (sizeAll > 0) {
      this.equipService.listar(0, sizeAll).subscribe(eqps => this.equipamentosData = eqps.content)
      this.equipamentosData.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1)
    }
  }

  pageFilter() {
    if (this.sizeLocs > 0) {
      this.locService.listar(0, this.sizeLocs).subscribe(locs => this.locaisFilter = locs.content)
    }
  }

  getEquipamento(): FormArray {
    return this.form.get('localEquipamentos') as FormArray;
  }

  addEquip(equip: LocalEquipamento) {
    this.getEquipamento().push(new FormControl(equip));
  }

  onSelectEquipamentos() {
    if (this.selectedEquipamentos.length <= 0) {
      this.clearSelect();
    } else if (this.selectedEquipamentos.length > 0 && this.selectedEquipQtd.length > 0) {
      this.verificarGetEquip();

      let removedIndexes = [];

      for (let i = 0; i < this.selectedEquipQtd.length; i++) {
        const item = this.selectedEquipQtd[i];
        if (!this.selectedEquipamentos.some(e => e.id === item.equipamento?.id)) {
          removedIndexes.push(i);
        }
      }

      for (let i = removedIndexes.length - 1; i >= 0; i--) {
        const index = removedIndexes[i];
        this.selectedEquipQtd.splice(index, 1);
        this.selectedQtd.splice(index, 1);
        this.getEquipamento().removeAt(index);
      }
    }
  }

  pushGetEquipVazio(equipamento: Equipamento, quantidade: number) {
    const tempEquipamento: LocalEquipamento = {
      id: null,
      local: null,
      equipamento: equipamento,
      quantidade: quantidade
    };
    this.addEquip(tempEquipamento);
  }

  pushGetEquipId(equipamento: Equipamento, quantidade: number, index: number, id: number | null, local: Local | null) {
    this.getEquipamento().at(index).patchValue({
      id: id,
      local: local,
      equipamento: equipamento,
      quantidade: quantidade
    });
  }

  adicionarEquipamentoComQuantidade(equipamento: Equipamento, quantidade: number) {
    this.verificarGetEquip();

    const index = this.selectedEquipQtd.findIndex(item => item.equipamento?.id === equipamento.id);
    if (index === -1) {
      this.selectedEquipQtd.push({ equipamento, quantidade });
      this.pushGetEquipVazio(equipamento, quantidade);
    } else {
      this.selectedEquipQtd[index].equipamento = equipamento;
      this.selectedEquipQtd[index].quantidade = quantidade;
      if (this.getEquipamento().length <= 0) {
        this.pushGetEquipVazio(equipamento, quantidade);
      } else {
        this.pushGetEquipId(equipamento, quantidade, index, null, null);
      }
    }
  }

  adicionarEquipamentoComQuantidadeEdit(equipamento: Equipamento, quantidade: number) {
    let idPrevious: number | null = null;
    let idPreviousEquip: number | undefined = undefined;
    let localPrevious: Local | null = null;
    this.verificarGetEquip();

    const previousIndex = this.previousEquipLocal.findIndex(item => item.equipamento?.id === equipamento.id);
    if (previousIndex !== -1) {
      idPrevious = this.previousEquipLocal[previousIndex].id;
      idPreviousEquip = this.previousEquipLocal[previousIndex].equipamento?.id;
      localPrevious = this.previousEquipLocal[previousIndex].local;
    }

    const index = this.selectedEquipQtd.findIndex(item => item.equipamento?.id === equipamento.id);
    if (index === -1 || (index === -1 && equipamento.id != idPreviousEquip)) {
      this.selectedEquipQtd.push({ equipamento, quantidade });
      this.pushGetEquipVazio(equipamento, quantidade);
    } else if ((index !== -1) || (equipamento.id == idPreviousEquip)) {
      this.selectedEquipQtd[index].equipamento = equipamento;
      this.selectedEquipQtd[index].quantidade = quantidade;
      if (this.getEquipamento().length <= 0) {
        this.pushGetEquipVazio(equipamento, quantidade);
      } else {
        this.pushGetEquipId(equipamento, quantidade, index, idPrevious, localPrevious);
      }
    }
  }

  showInfoDialog(value: Local) {
    this.visibleInfo = true;
    this.localInfo = value;
  }

  showEditDialog(value: Local) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Local'
    this.visible = true;
    this.cadastrar = false;
    this.editar = true;

    this.clearSelect();

    this.form.patchValue({
      id: value.id,
      nome: value.nome,
      capacidade: value.capacidade,
      localEquipamentos: value.localEquipamentos
    });

    value.localEquipamentos
      .filter(le => {
        if (le.equipamento !== null && le.quantidade !== null && le.local !== null) {
          this.selectedEquipamentos.push(le.equipamento);
          this.selectedQtd.push(le.quantidade);
          this.selectedEquipQtd.push({ equipamento: le.equipamento, quantidade: le.quantidade })

          const tempEquipamento: LocalEquipamento = {
            id: le.id,
            local: value,
            equipamento: le.equipamento,
            quantidade: le.quantidade
          };
          this.addEquip(tempEquipamento);
        }
      })

    this.previousEquipLocal = value.localEquipamentos;
    this.multiselect.writeValue(value.localEquipamentos.map(le => le.equipamento));

  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Local';
    this.visible = true;
    this.cadastrar = true;
    this.editar = false;
    this.multiselect.writeValue(null);
    this.clearSelect();
  }

  hideDialog() {
    this.visible = false;
    this.form.reset();
    this.multiselect.writeValue(null);
    this.clearSelect();
  }

  limparFilter() {
    const inputElement = this.inputSearch.nativeElement.value
    if (inputElement) {
      this.inputSearch.nativeElement.value = '';
    }
    this.selectedFilter = {} as FiltrarPesquisa;
  
    this.locService.listar(0, 10).subscribe(alno => {
      this.locaisData = alno.content;

      this.firstLocs = 0
      this.sizeLocs = this.sizeLocsTemp
      this.rowsLocs = 10
    });
  }

  searchFilter0(term: string) {
    this.locService.acharNome(0, 10, term).subscribe(alno => {
      this.locaisFilter = alno.content
      this.locaisData = this.locaisFilter
      this.sizeLocsTemp = this.sizeLocs
      this.sizeLocs = alno.totalElements
    })
  }

  searchFilter1(term: string) {
    const searchTermAsNumber = parseInt(term);
    if (!isNaN(searchTermAsNumber)) {
      this.locService.acharCapacidade(0, 10, searchTermAsNumber).subscribe(alno => {
        this.locaisFilter = alno.content
        this.locaisData = this.locaisFilter
        this.sizeLocsTemp = this.sizeLocs
        this.sizeLocs = alno.totalElements
      })
    }
  }

  onKeyDown(event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      this.filterField(searchTerm);
    }
  }

  filterField(searchTerm: string) {
    if (searchTerm && (searchTerm != null || searchTerm != '')) {
      if (this.selectedFilter) {
        if (this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
        if (this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
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

  confirm3(event: Event, codes: Local[]) {
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
    this.locService.criar(this.locaisCadast).subscribe({
      next: (data: any) => {
        this.locaisCadast = data;
        // this.goToRouteSave();
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Local cadastrado com sucesso!', life: 3000 },
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
    this.locService.atualizar(id, this.locaisEdit).subscribe({
      next: (data: any) => {
        this.locaisEdit = data;
        // this.goToRouteEdit(id);
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Local editado com sucesso!', life: 3000 },
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
    console.log(this.form.value)

    if (this.getEquipamento().length > 0) {
      this.verificarGetEquip();

      if (this.form.valid && this.cadastrar) {
        this.locaisCadast = this.form.value;
        this.enviarFormSave();
        this.visible = false;
        this.form.reset();
        this.clearSelect();
        this.ngOnInit();
      } else if (this.form.valid && this.editar) {
        this.locaisEdit = this.form.value;
        this.enviarFormEdit(this.form.get('id')?.value);
        this.visible = false;
        this.form.reset();
        this.clearSelect();
        this.ngOnInit();
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
    this.selectedEquipamentos = [];
    this.selectedQtd = [];
    this.selectedEquipQtd = [];
    this.getEquipamento().clear();
  }

  verificarGetEquip() {
    for (let i = this.getEquipamento().length - 1; i >= 0; i--) {
      if (this.getEquipamento().at(i).value === null) {
        this.getEquipamento().removeAt(i);
      }
    }
  }

  deletarID(id: number) {
    this.locService.excluir(id)
      .subscribe({
        next: (data: any) => {
          this.ngOnInit();
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Registro deletado com sucesso!', life: 3000 },
          ];
          // window.location.reload();
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
