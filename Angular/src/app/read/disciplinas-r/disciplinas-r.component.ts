import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Disciplina } from '../../models/disciplina.models';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DisciplinaService } from '../../service/disciplina.service';
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

@Component({
  selector: 'app-disciplinas-r',
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
    ConfirmPopupModule
  ],
  templateUrl: './disciplinas-r.component.html',
  styleUrl: './disciplinas-r.component.scss',
  providers: [
    DisciplinaService,
    ConfirmationService,
    MessageService
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

  constructor(
    private disciService: DisciplinaService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]]
      });
  }

  ngOnInit() {
    this.unsubscribe$ = this.disciService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.disciplinasData = data.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
        this.dicisplinasFilter = this.disciplinasData;
      },
      error: (err: any) => {
        alert('Dados não encontrados.')
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
  }

  showEditDialog(value: Disciplina) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Disciplina'
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
    this.ehTitulo = 'Cadastrar Disciplina';
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
    this.disciplinasData = this.dicisplinasFilter;
  }

  searchFilterWord(term: string) {
    this.disciplinasData = this.dicisplinasFilter.filter(el => {
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
    this.disciService.criar(this.disciplinasCadast).subscribe({
      next: (data: any) => {
        this.disciplinasCadast = data;
        this.goToRouteSave();
        alert('Disciplina cadastrada com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Cadastro não enviado.')
      }
    });
  }

  enviarFormEdit(id: number) {
    this.disciService.atualizar(id, this.disciplinasEdit).subscribe({
      next: (data: any) => {
        this.disciplinasEdit = data;
        this.goToRouteEdit(id);
        alert('Disciplina editada com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Edição não enviada.')
      }
    });
  }

  goToRouteSave() {
    this.router.navigate(['api/disciplinas']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/disciplinas', id]);
  }

  onSubmit() {
    if (this.form.valid && this.cadastrar) {
      this.disciplinasCadast = this.form.value;
      this.enviarFormSave();
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.disciplinasEdit = this.form.value;
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
    this.disciService.excluir(id)
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

