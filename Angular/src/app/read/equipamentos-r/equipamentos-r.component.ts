import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';
import { Equipamento } from '../../models/equipamento.models';
import { EquipamentoService } from '../../service/equipamento.service';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

@Component({
  selector: 'app-equipamentos-r',
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
    ConfirmPopupModule
  ],
  templateUrl: './equipamentos-r.component.html',
  styleUrl: './equipamentos-r.component.scss',
  providers: [
    EquipamentoService,
    ConfirmationService,
    MessageService
  ]
})

export class EquipamentosRComponent implements OnInit {
  @ViewChild('searchInput') inputSearch!: ElementRef;

  equipamentosData: Equipamento[] = [];
  equipamentosFilter: Equipamento[] = [];
  equipamentosCadast: Equipamento[] = [];
  equipamentosEdit: Equipamento[] = [];
  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;

  constructor(
    private equipService: EquipamentoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]]
      });
  }

  ngOnInit() {
    this.equipamentosData = [
      {
          id: 3,
          nome: 'Name product',
          // descricao: 'Product Description 3 hjgkytftf hjfuj hjgujj hyfuyhjv kgfhcdgjc  gtchtg jkbgvfjtd hjytfjy ghfht ghjydtrd gcjydjrdjt gdcg fgxhtrd'
      },
      {
          id: 4,
          nome: 'Name product',
          // descricao: 'Product Description 4'
      },
      {
          id: 1,
          nome: 'Name product bhgfhgv hjbkjgvgkh bjhjhv vhgvkhghg vjkgvkhgjkkhgk gvhkgvkgh',
          // descricao: 'Product Description 1'
      },
      {
          id: 5,
          nome: 'Name product',
          // descricao: 'Product Description 5'
      },
      {
          id: 2,
          nome: 'Name product',
          // descricao: 'Product Description 2'
      },
      {
          id: 6,
          nome: 'Name product',
          // descricao: 'Product Description 6'
      }
    ];

    this.equipamentosFilter = this.equipamentosData;
  }

  showEditDialog(value: Equipamento) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Equipamento'
    this.visible = true;
    this.cadastrar = false;
    this.editar = true;
    this.form.setValue({
      id: value.id,
      nome: value.nome
    })
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Equipamento'
    this.visible = true;
    this.cadastrar = true;
    this.editar = false;
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
    this.equipamentosData = this.equipamentosFilter;
  }

  searchFilterWord(term: string) {
    this.equipamentosData = this.equipamentosFilter.filter(el => {
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
        this.messageService.add({ severity: 'error', summary: 'Cancelado', detail: 'Você cancelou ação', life: 3000 });
      }
    });
  }

  enviarFormSave() {
    this.equipService.criar(this.equipamentosCadast).subscribe({
      next: (data: any) => {
        this.equipamentosCadast = data;
        this.goToRouteSave();
        alert('Equipamento cadastrado com sucesso!');
      },
      error: (err: any) => {
        alert('Cadastro não enviado.')
      }
    });
  }

  enviarFormEdit(id: number) {
    this.equipService.atualizar(id, this.equipamentosEdit).subscribe({
      next: (data: any) => {
        this.equipamentosEdit = data;
        this.goToRouteEdit(id);
        alert('Equipamento editado com sucesso!');
      },
      error: (err: any) => {
        alert('Edição não enviada.')
      }
    });
  }

  goToRouteSave() {
    this.router.navigate(['api/equipamentos']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/equipamentos', id]);
  }

  onSubmit() {
    if (this.form.valid && this.cadastrar) {
      this.equipamentosCadast = this.form.value;
      this.enviarFormSave();
      this.form.reset();
    } else if (this.form.valid && this.editar) {
      this.equipamentosEdit = this.form.value;
      this.enviarFormEdit(this.form.get('id')?.value);
      this.form.reset();
    } else {
      alert('Informação inválida. Preencha o campo!');
    }
  }

  deletarID(id: number) {
    this.equipService.excluir(id)
    .subscribe(
      data => {
        // window.location.reload();
        alert('Registro deletado');
        this.ngOnInit();
      },
      error => {
        if (error.status) {
          alert('Erro: Não foi possível deletar registro.');
        } else {
          console.log('Erro desconhecido:', error);
          alert('Erro desconhecido' + error);
        }
      }
    );
  }

}
