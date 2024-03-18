import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
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
import { CoordenadorService } from '../../../service/coordenador.service';
import { Coordenador } from '../../../models/coordenador.models';

@Component({
  selector: 'app-coordenadores-r',
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
  ],
  templateUrl: './coordenadores-r.component.html',
  styleUrl: './coordenadores-r.component.scss',
  providers: [
    CoordenadorService,
    ConfirmationService,
    MessageService
  ]
})
export class CoordenadoresRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;

  coordenadoresData: Coordenador[] = [];
  coordenadoresFilter: Coordenador[] = [];
  coordenadoresCadast: Coordenador[] = [];
  coordenadoresEdit: Coordenador[] = [];

  unsubscribe$!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;

  constructor(
    private coordService: CoordenadorService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        matricula: [null, [Validators.required]],
        curso: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
      });
  }

  ngOnInit() {
    this.unsubscribe$ = this.coordService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.coordenadoresData = data.sort((a:any, b:any) => (a.nome < b.nome ) ? -1 : 1);
        this.coordenadoresFilter = this.coordenadoresData;
      },
      error: (err: any) => {
        alert('Dados não encontrados.')
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
  }

  showEditDialog(value: Coordenador) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Coordenador'
    this.visible = true;
    this.cadastrar = false;
    this.editar = true;
    this.form.setValue({
      id: value.id,
      nome: value.nome,
      matricula: value.matricula,
      curso: value.curso,
    })
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Coordenador';
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
    this.coordenadoresData = this.coordenadoresFilter;
  }

  searchFilterWord(term: string) {
    this.coordenadoresData = this.coordenadoresFilter.filter(el => {
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
        this.messageService.add({ severity: 'error', summary: 'Cancelado', detail: 'Exclusão cancelada.', life: 3000 });
      }
    });
  }

  enviarFormSave() {
    this.coordService.criar(this.coordenadoresCadast).subscribe({
      next: (data: any) => {
        this.coordenadoresCadast = data;
        this.goToRouteSave();
        alert('Coordenador cadastrado com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Cadastro não enviado.')
      }
    });
  }

  enviarFormEdit(id: number) {
    this.coordService.atualizar(id, this.coordenadoresEdit).subscribe({
      next: (data: any) => {
        this.coordenadoresEdit = data;
        this.goToRouteEdit(id);
        alert('Coordenador editado com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Edição não enviada.')
      }
    });
  }

  goToRouteSave() {
    this.router.navigate(['api/coordenadores']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/coordenadores', id]);
  }

  onSubmit() {
    if (this.form.valid && this.cadastrar) {
      this.coordenadoresCadast = this.form.value;
      this.enviarFormSave();
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.coordenadoresEdit = this.form.value;
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
    this.coordService.excluir(id)
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
          // console.log('Erro desconhecido:', err);
          alert('Erro desconhecido' + err);
        }
      }
  });
  }

}

