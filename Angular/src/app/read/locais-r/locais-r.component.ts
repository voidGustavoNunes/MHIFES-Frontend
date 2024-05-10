import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LocalService } from '../../service/local.service';
import { Local, LocalEquipMultiSelect, LocalEquipamento } from '../../models/local.models';
import { EquipamentoService } from '../../service/equipamento.service';
import { Equipamento } from '../../models/equipamento.models';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { MultiSelect } from 'primeng/multiselect';

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
  
  selectedEquipamentos: Equipamento[]=[];
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
      {nome: 'Nome do local', id: 0},
      {nome: 'Capacidade', id: 1}
    ];

    this.unsubscribe$ = this.locService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.locaisData = data.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
        this.locaisFilter = this.locaisData;
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de locais não encontrados.' },
        ];
      }
    });

    this.unsubscribe$EQ = this.equipService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.equipamentosData = data.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de equipamentos não encontrados.' },
        ];
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
    this.unsubscribe$EQ.unsubscribe();
  }

  getEquipamento(): FormArray {
    return this.form.get('localEquipamentos') as FormArray;
  }

  addEquip(equip: LocalEquipamento) {
    this.getEquipamento().push(new FormControl(equip));
  }

  onSelectEquipamentos() {
    if(this.selectedEquipamentos.length <= 0) {
      this.clearSelect();
    } else if(this.selectedEquipamentos.length > 0 && this.selectedEquipQtd.length > 0) {
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
      if(this.getEquipamento().length <= 0){
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
    } else if((index !== -1) || (equipamento.id == idPreviousEquip)) {
      this.selectedEquipQtd[index].equipamento = equipamento;
      this.selectedEquipQtd[index].quantidade = quantidade;
      if(this.getEquipamento().length <= 0){
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
      if(le.equipamento !== null && le.quantidade !== null && le.local !== null) {
        this.selectedEquipamentos.push(le.equipamento);
        this.selectedQtd.push(le.quantidade);
        this.selectedEquipQtd.push({equipamento: le.equipamento, quantidade: le.quantidade })
        
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
  
  limparFilter(){
    const inputElement = this.inputSearch.nativeElement.value
    if (inputElement) {
      this.inputSearch.nativeElement.value = '';
    }
    this.selectedFilter = {} as FiltrarPesquisa;
    this.locaisData = this.locaisFilter;
  }

  searchFilter0(term: string) {
    this.locaisData = this.locaisFilter.filter(local => {
      if (local.nome.toLowerCase().includes(term.toLowerCase())) {
        return local;
      } else {
        return null;
      }
    })
  }

  searchFilter1(term: string) {
    const searchTermAsNumber = parseInt(term);

    this.locaisData = this.locaisFilter.filter(local => {
      if (!isNaN(searchTermAsNumber) && local?.capacidade == searchTermAsNumber) {
        return local;
      } else {
        return null;
      }
    })
  }

  onKeyDown(event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      this.filterField(searchTerm);
    }
  }

  filterField(searchTerm: string) {
    if (searchTerm != null || searchTerm != '') {
      if(this.selectedFilter) {
        if(this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
        if(this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
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
          { severity: 'error', summary: 'Erro', detail: 'Cadastro não enviado.', life: 3000 },
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
          // { severity: 'error', summary: 'Erro', detail: err, life: 3000 },
          { severity: 'error', summary: 'Erro', detail: 'Edição não enviada.', life: 3000 },
        ];
      }
    });
  }

  onSubmit() {
    console.log(this.form.value)

    if(this.getEquipamento().length > 0) {
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
