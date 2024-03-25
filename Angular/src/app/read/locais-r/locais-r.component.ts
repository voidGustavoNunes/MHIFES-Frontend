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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ScrollTopModule } from 'primeng/scrolltop';
import { LocalService } from '../../service/local.service';
import { Local } from '../../models/local.models';
import { EquipamentoService } from '../../service/equipamento.service';
import { Equipamento } from '../../models/equipamento.models';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';

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
    MultiSelectModule
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
  locaisCadast: Local[] = [];
  locaisEdit: Local[] = [];
  
  equipamentosData: Equipamento[] = [];
  
  unsubscribe$!: Subscription;
  unsubscribe$EQ!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;

  constructor(
    private locService: LocalService,
    private equipService: EquipamentoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        capacidade: [null, Validators.required],
        equipamentos: this.formBuilder.array([], Validators.required)
      });
  }

  ngOnInit() {
    this.unsubscribe$ = this.locService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.locaisData = data.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
        this.locaisFilter = this.locaisData;
      },
      error: (err: any) => {
        alert('Dados de locais não encontrados.')
      }
    });

    this.unsubscribe$EQ = this.equipService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.equipamentosData = data.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
      },
      error: (err: any) => {
        alert('Dados de equipamentos não encontrados.')
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
    this.unsubscribe$EQ.unsubscribe();
  }

  getEquipamento(): FormArray {
    return this.form.get('equipamentos') as FormArray;
  }

  addEquip(equip: Equipamento) {
    this.getEquipamento().push(new FormControl(equip));
    // console.log('add => ',this.getEquipamento())
  }

  onEquipamentosChange(event: any) {
    this.getEquipamento().clear();
    // console.log('clear => ',this.getEquipamento())

    event.value.forEach((equip: Equipamento) => {
      this.addEquip(equip);
    });
  }
  
  showEditDialog(value: Local) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Local'
    this.visible = true;
    this.cadastrar = false;
    this.editar = true;
    
    this.form.patchValue({
      id: value.id,
      nome: value.nome,
      capacidade: value.capacidade,
      equipamentos: value.equipamentos
    });

    this.multiselect.writeValue(value.equipamentos)
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Local';
    this.visible = true;
    this.cadastrar = true;
    this.editar = false;
    this.multiselect.writeValue(null);
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
    this.locaisData = this.locaisFilter;
  }

  searchFilterWord(term: string) {
    this.locaisData = this.locaisFilter.filter(el => {
      if (el.nome.toLowerCase().includes(term.toLowerCase())) {
        return el;
      } else {
        return null;
      }
    })
  }

  onKeyDown(event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      if (searchTerm != null || searchTerm != '') {
        this.searchFilterWord(searchTerm);
      }
    }
  }

  filterField(searchTerm: string) {
    if (searchTerm != null || searchTerm != '') {
      this.searchFilterWord(searchTerm);
    }
  }

  formatarEquipamentos(equip: Equipamento[]): string {
    if (equip.length === 0) {
      return 'Erro! Equipamento não encontrados.';
    }
  
    let formattedString = equip.map(equipamento => equipamento.nome).join(', ');
  
    return formattedString;
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
        this.messageService.add({ severity: 'error', summary: 'Cancelado', detail: 'Exclusão cancelada.', life: 3000 });
      }
    });
  }

  enviarFormSave() {
    this.locService.criar(this.locaisCadast).subscribe({
      next: (data: any) => {
        this.locaisCadast = data;
        this.goToRouteSave();
        alert('Local cadastrado com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Cadastro não enviado.')
      }
    });
  }

  enviarFormEdit(id: number) {
    this.locService.atualizar(id, this.locaisEdit).subscribe({
      next: (data: any) => {
        this.locaisEdit = data;
        this.goToRouteEdit(id);
        alert('Local editado com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Edição não enviada.')
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
    if (this.form.valid && this.cadastrar) {
      this.locaisCadast = this.form.value;
      this.enviarFormSave();
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.locaisEdit = this.form.value;
      this.enviarFormEdit(this.form.get('id')?.value);
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      window.location.reload();
    } else {
      alert('Informação inválida. Preencha o campo!');
    }
  }

  deletarID(id: number) {
    this.locService.excluir(id)
    .subscribe({
      next: (data: any) => {
        alert('Registro deletado com sucesso!');
        this.ngOnInit();
        window.location.reload();
      },
      error: (err: any) => {
        if (err.status) {
          alert('Erro! Não foi possível deletar registro.');
        } else {
          alert('Erro desconhecido' + err);
        }
      }
  });
  }

}
