import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
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
import { LocalService } from '../../service/local.service';
import { Local, LocalDTO, LocalEquipamento } from '../../models/local.models';
import { EquipamentoService } from '../../service/equipamento.service';
import { Equipamento } from '../../models/equipamento.models';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { MessagesModule } from 'primeng/messages';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';

@Component({
  selector: 'app-locais-r',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TableModule,
    DialogModule,
    PaginatorModule,
    ReactiveFormsModule,
    FormsModule,
    ToastModule,
    ScrollTopModule,
    ConfirmPopupModule,
    InputNumberModule,
    MultiSelectModule,
    MessagesModule,
    OverlayPanelModule
  ],
  templateUrl: './locais-r.component.html',
  styleUrl: './locais-r.component.scss',
  providers: [
    LocalService,
    EquipamentoService,
    ConfirmationService,
    MessageService
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
  selectedEquip: Equipamento[]=[];
  selectedQtd: number[]=[];
  previousSelection: Equipamento[]=[];
  // localBodyDto!: LocalDTO;
  
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
      {nome: 'Nome do equipamento', id: 1}
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
    if(this.selectedEquip.length > 0) {
      this.getEquipamento().clear();
      
      const removedItems = this.previousSelection.filter(item => !this.selectedEquip.includes(item));
      const removedItemIndices = removedItems.map(item => this.previousSelection.indexOf(item));
      
      removedItemIndices.forEach(index => {
        if (index !== -1) {
          this.selectedQtd.splice(index, 1);
        }
      });
      this.previousSelection = this.selectedEquip;
      
        for (let i = 0; i < this.selectedEquip.length; i++) {
          const tempEquipamento: LocalEquipamento = {
            id: null,
            local: null,
            equipamento:this.selectedEquip[i],
            quantidade:this.selectedQtd[i]
          };
          this.addEquip(tempEquipamento);
        }
        console.log(this.getEquipamento().value)
    } else {
      this.selectedQtd = [];
      this.previousSelection = [];
      this.getEquipamento().clear();
    }
  }

  onSelectEquipamentosEdit() {
    if(this.selectedEquip.length > 0) {
      this.getEquipamento().clear();
      
      this.selectedEquip.forEach((equipamento, index) => {
        const selectedEquipamento = this.selectedEquip[index];
        const selectedQtd = this.selectedQtd[index];

        const existingEquipamento = this.previousEquipLocal.find(prevEquip => prevEquip.equipamento === selectedEquipamento);
        if (existingEquipamento) {
            const tempEquipamento: LocalEquipamento = {
                id: existingEquipamento.id,
                local: null,
                equipamento: selectedEquipamento,
                quantidade: selectedQtd
            };
            this.addEquip(tempEquipamento);
        } else {
            const tempEquipamento: LocalEquipamento = {
                id: null,
                local: null,
                equipamento: selectedEquipamento,
                quantidade: selectedQtd
            };
            this.addEquip(tempEquipamento);
        }
        this.previousSelection.push(equipamento);
      });

      console.log(this.getEquipamento().value);
    } else {
      this.selectedQtd = [];
      this.previousSelection = [];
      this.previousEquipLocal = [];
      this.getEquipamento().clear();
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

    this.previousSelection = value.localEquipamentos
      .filter(le => le.equipamento !== null)
      .map(le => le.equipamento as Equipamento);

    this.selectedEquip = value.localEquipamentos
      .filter(le => le.equipamento !== null)
      .map(le => le.equipamento as Equipamento);

    this.selectedQtd = value.localEquipamentos
      .filter(le => le.quantidade !== null)
      .map(le => le.quantidade as number);
    
    value.localEquipamentos.map(le=>{
      this.addEquip(le)
    });

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
    this.locaisData = this.locaisFilter.filter(local => {
      local.localEquipamentos?.filter(equip =>{
        if (equip.equipamento?.nome.toLowerCase().includes(term.toLowerCase())) {
          return local;
        } else {
          return null;
        }
      })
    })
  }

  onKeyDown(event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      if (searchTerm != null || searchTerm != '') {
        if(this.selectedFilter) {
          if(this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
          if(this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
        }
      }
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
        this.goToRouteSave();
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
        this.goToRouteEdit(id);
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

  goToRouteSave() {
    this.router.navigate(['api/locais']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/locais', id]);
  }

  onSubmit() {
    if(this.selectedEquip.length > 0 && this.selectedQtd.length > 0) {
      for (let i = this.getEquipamento().length - 1; i >= 0; i--) {
        if (this.getEquipamento().at(i).value === null) {
          this.getEquipamento().removeAt(i);
        }
      }
      if (this.form.valid && this.cadastrar) {
        this.locaisCadast = this.form.value;
        console.log(this.form.value)
        this.enviarFormSave();
        this.visible = false;
        this.form.reset();
        this.clearSelect();
        this.ngOnInit();
      } else if (this.form.valid && this.editar) {
        this.locaisEdit = this.form.value;
        console.log(this.form.value)

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
    this.previousSelection = [];
    this.selectedEquip = [];
    this.previousEquipLocal = [];
    this.selectedQtd = [];
    this.getEquipamento().clear();
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
