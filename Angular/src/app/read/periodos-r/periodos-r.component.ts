import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PeriodoService } from '../../service/periodo.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Periodo } from '../../models/periodo.models';
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
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-periodos-r',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TableModule,
    DialogModule,
    PaginatorModule,
    ToastModule,
    ScrollTopModule,
    ConfirmPopupModule,
    CalendarModule
  ],
  templateUrl: './periodos-r.component.html',
  styleUrl: './periodos-r.component.scss',
  providers: [
    PeriodoService,
    ConfirmationService,
    MessageService
  ]
})
export class PeriodosRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;

  periodosData: Periodo[] = [];
  periodosFilter: Periodo[] = [];
  periodosCadast: Periodo[] = [];
  periodosEdit: Periodo[] = [];

  unsubscribe$!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;

  constructor(
    private periodService: PeriodoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        dataInicio: [null],
        dataFim: [null],
        descricao: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]]
      }, { validator: this.validarDatas });
  }

  ngOnInit() {
    this.unsubscribe$ = this.periodService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.periodosData = data.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
        this.periodosFilter = this.periodosData;
      },
      error: (err: any) => {
        alert('Dados não encontrados.')
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
  }

  validarDatas(formGroup: FormGroup) {
    const dataInicio = formGroup.get('dataInicio')?.value;
    const dataFim = formGroup.get('dataFim')?.value;

    if (dataInicio && dataFim && new Date(dataFim) < new Date(dataInicio)) {
      formGroup.get('dataFim')?.setErrors({ 'invalidEndDate': true });
    } else {
      formGroup.get('dataFim')?.setErrors(null);
    }
  }

  showEditDialog(value: Periodo) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Período'
    this.visible = true;
    this.cadastrar = false;
    this.editar = true;
    this.form.setValue({
      id: value.id,
      dataInicio: value.dataInicio,
      dataFim: value.dataFim,
      descricao: value.descricao
    })
    this.form.controls['dataFim'].setValue(new Date(value.dataFim));
    this.form.controls['dataInicio'].setValue(new Date(value.dataInicio));
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Período';
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
    this.periodosData = this.periodosFilter;
  }

  searchFilterWord(term: string) {
    this.periodosData = this.periodosFilter.filter(el => {
      const searchTermAsNumber = parseInt(term);
      if (!isNaN(searchTermAsNumber)) {
        const ano = new Date(el.dataInicio).getFullYear();
        if (ano === searchTermAsNumber) {
          return el;
        } else {
          return null;
        }
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
    this.periodService.criar(this.periodosCadast).subscribe({
      next: (data: any) => {
        this.periodosCadast = data;
        this.goToRouteSave();
        alert('Perídodo cadastrado com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Cadastro não enviado.')
      }
    });
  }

  enviarFormEdit(id: number) {
    this.periodService.atualizar(id, this.periodosEdit).subscribe({
      next: (data: any) => {
        this.periodosEdit = data;
        this.goToRouteEdit(id);
        alert('Perídodo editado com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Edição não enviada.')
      }
    });
  }

  goToRouteSave() {
    this.router.navigate(['api/periodos']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/periodos', id]);
  }

  onSubmit() {
    if (this.form.valid && this.cadastrar) {
      this.periodosCadast = this.form.value;
      this.enviarFormSave();
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.periodosEdit = this.form.value;
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
    this.periodService.excluir(id)
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

