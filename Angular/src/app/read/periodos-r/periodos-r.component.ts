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
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ScrollTopModule } from 'primeng/scrolltop';
import { CalendarModule } from 'primeng/calendar';
import { MessagesModule } from 'primeng/messages';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';

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
    CalendarModule,
    MessagesModule,
    OverlayPanelModule
  ],
  templateUrl: './periodos-r.component.html',
  styleUrl: './periodos-r.component.scss',
  providers: [
    PeriodoService,
    ConfirmationService,
    MessageService,
  ]
})
export class PeriodosRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;

  periodosData: Periodo[] = [];
  periodosFilter: Periodo[] = [];
  periodosCadast: Periodo[] = [];
  periodosEdit: Periodo[] = [];

  periodoInfo!: Periodo;
  visibleInfo: boolean = false;

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
  txtFilter: string = 'Pesquisar período';

  constructor(
    private periodService: PeriodoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        dataInicio: [null, [Validators.required]],
        dataFim: [null, [Validators.required]],
        descricao: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(5000)]]
      }, { validator: this.validarDatas });
  }

  ngOnInit() {

    this.filterOptions = [
      {nome: 'Data de Início', id: 0},
      {nome: 'Descrição', id: 1},
      {nome: 'Ano do Período', id: 2}
    ];

    this.unsubscribe$ = this.periodService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        
        data.sort((a: Periodo, b: Periodo) => {
          const dateA = new Date(a.dataInicio);
          const dateB = new Date(b.dataInicio);
          return dateB.getTime() - dateA.getTime();
        });
        
        this.periodosData = data;
        this.periodosFilter = this.periodosData;
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados não encontrados.', life: 3000 },
        ];
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
    this.visibleInfo = false;
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

  showInfoDialog(value: Periodo) {
    this.visibleInfo = true;
    this.periodoInfo = value;
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Período';
    this.visible = true;
    this.visibleInfo = false;
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

  searchFilter0(term: string) {
    const dateTerm = this.formatarDtStrDt(term);
    
    if (dateTerm instanceof Date && !isNaN(dateTerm.getTime())) {
      this.periodosData = this.periodosFilter.filter(prd => {
        const tiparDT = prd.dataInicio;
        if (typeof tiparDT === 'string') {
          const tiparFormat = this.formatarDatas(tiparDT);
          const searchTerm = this.formatarDtStrDt(tiparFormat);
          
          if (dateTerm.getTime() === searchTerm?.getTime()) {
            return prd;
          } else {
            return null;
          }
        } else {
          return null;
        }
      })
    }
  }

  searchFilter1(term: string) {
    this.periodosData = this.periodosFilter.filter(prd => {
      if (prd.descricao.toLowerCase().includes(term.toLowerCase())) {
        return prd;
      } else {
        return null;
      }
    })
  }

  searchFilter2(term: string) {
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
        if(this.selectedFilter) {
          if(this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
          if(this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
          if(this.selectedFilter.id == 2) this.searchFilter2(searchTerm);
        }
      }
    }
  }
  
  filterField(searchTerm: string) {
    if (searchTerm != null || searchTerm != '') {
      if(this.selectedFilter) {
        if(this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
        if(this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
        if(this.selectedFilter.id == 2) this.searchFilter2(searchTerm);
      }
    }
  }

  formatarDatas(date: string) {
    const partes = date.split('-');
    const ano = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);

    const data = new Date(ano, mes, dia);

    const diaFormatado = ('0' + data.getDate()).slice(-2);
    const mesFormatado = ('0' + (data.getMonth() + 1)).slice(-2);
    const anoFormatado = data.getFullYear();

    return `${diaFormatado}/${mesFormatado}/${anoFormatado}`;
  }

  formatarDtStrDt(date: string) {
    if(date) {
      const partes = date.split('/');
      const ano = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const dia = parseInt(partes[2], 10);

      return new Date(dia, mes, ano);
    } else {
      return null;
    }
  }

  updateMask() {
    if (this.selectedFilter?.id == 0) {
      this.txtFilter = '00/00/0000';
    } else {
      this.txtFilter = 'Pesquisar período';
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
    this.periodService.criar(this.periodosCadast).subscribe({
      next: (data: any) => {
        this.periodosCadast = data;
        // this.goToRouteSave();
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Perídodo cadastrado com sucesso!', life: 3000 },
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
    this.periodService.atualizar(id, this.periodosEdit).subscribe({
      next: (data: any) => {
        this.periodosEdit = data;
        // this.goToRouteEdit(id);
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Perídodo editado com sucesso!', life: 3000 },
        ];
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Edição não enviada.', life: 3000 },
        ];
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
      // window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.periodosEdit = this.form.value;
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
    this.periodService.excluir(id)
    .subscribe({
      next: (data: any) => {
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Registro deletado com sucesso!', life: 3000 },
        ];
        this.ngOnInit();
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

