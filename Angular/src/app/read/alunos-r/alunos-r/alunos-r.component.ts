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
import { AlunoService } from '../../../service/aluno.service';
import { Aluno } from '../../../models/aluno.models';

@Component({
  selector: 'app-alunos-r',
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
  templateUrl: './alunos-r.component.html',
  styleUrl: './alunos-r.component.scss',
  providers: [
    AlunoService,
    ConfirmationService,
    MessageService
  ]
})

export class AlunosRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;

  alunosData: Aluno[] = [];
  alunosFilter: Aluno[] = [];
  alunosCadast: Aluno[] = [];
  alunosEdit: Aluno[] = [];

  unsubscribe$!: Subscription;
  form: FormGroup;


  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;

  constructor(
    private alunService: AlunoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private ngZone: NgZone
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        matricula: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        curso: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
      });
  }

  ngOnInit() {
    this.unsubscribe$ = this.alunService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.alunosData = data.sort((a:any, b:any) => (a.nome < b.nome ) ? -1 : 1);
        this.alunosFilter = this.alunosData;
      },
      error: (err: any) => {
        // this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Dados não encontrados.', life: 3000 });
        alert('Dados não encontrados.')
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
  }

  showEditDialog(value: Aluno) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Aluno'
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
    this.ehTitulo = 'Cadastrar Aluno';
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
    this.alunosData = this.alunosFilter;
  }

  searchFilterWord(term: string) {
    this.alunosData = this.alunosFilter.filter(el => {
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
    this.alunService.criar(this.alunosCadast).subscribe({
      next: (data: any) => {
        this.alunosCadast = data;
        this.goToRouteSave();
        alert('Aluno cadastrado com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Cadastro não enviado.')
      }
    });
  }

  enviarFormEdit(id: number) {
    this.alunService.atualizar(id, this.alunosEdit).subscribe({
      next: (data: any) => {
        this.alunosEdit = data;
        this.goToRouteEdit(id);
        alert('aluno editado com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Edição não enviada.')
      }
    });
  }

  goToRouteSave() {
    this.router.navigate(['api/alunos']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/alunos', id]);
  }

  onSubmit() {
    if (this.form.valid && this.cadastrar) {
      this.alunosCadast = this.form.value;
      this.enviarFormSave();
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.alunosEdit = this.form.value;
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
    this.alunService.excluir(id)
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
