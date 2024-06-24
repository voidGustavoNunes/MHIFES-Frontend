import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Equipamento } from '../../models/postgres/equipamento.models';
import { EquipamentoService } from '../../service/equipamento.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { PaginatorState } from 'primeng/paginator';
import { Page } from '../../models/share/page.models';

@Component({
  selector: 'app-equipamentos-r',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PrimeNgImportsModule
  ],
  templateUrl: './equipamentos-r.component.html',
  styleUrl: './equipamentos-r.component.scss',
  providers: [
    EquipamentoService,
    ConfirmationService,
    MessageService,
  ]
})

export class EquipamentosRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;

  equipamentosData: Equipamento[] = [];
  equipamentosFilter: Equipamento[] = [];
  equipamentosCadast: Equipamento[] = [];
  equipamentosEdit: Equipamento[] = [];

  unsubscribe$!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;
  
  messages!: Message[];
  mss: boolean = false;
  
  firstEqp: number = 0;
  pageEqp: number = 0;
  rowsEqp: number = 10;
  sizeEqp: number = 0;

  sizeEqpTemp: number = 0;

  equipamentosPageData!: Page<Equipamento>;

  constructor(
    private equipService: EquipamentoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]]
      });
  }

  ngOnInit() {
    this.unsubscribe$ = this.equipService.listar(0,10)
    .subscribe({
      next: (itens:any) => {
        this.equipamentosPageData = itens;
        this.sizeEqp = this.equipamentosPageData.totalElements;
        
        this.equipamentosData = this.equipamentosPageData.content;
        this.equipamentosData.sort((a:any, b:any) => (a.nome < b.nome ) ? -1 : 1);
        this.pageFilter()
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
  
  onPageChange(event: PaginatorState) {
    if (event.first !== undefined && event.rows !== undefined && event.page !== undefined) {
      this.firstEqp = event.first;
      this.rowsEqp = event.rows;
      this.pageEqp = event.page;
      this.listarPage()
    }
  }

  listarPage() {
    this.equipService.listar(this.pageEqp, this.rowsEqp)
    .subscribe((itens:any) => {
        this.equipamentosPageData = itens;
        this.equipamentosData = this.equipamentosPageData.content;
        this.equipamentosData.sort((a:any, b:any) => (a.nome < b.nome ) ? -1 : 1);
      });
  }

  pageFilter() {
    if(this.sizeEqp > 0) {
      this.equipService.listar(0, this.sizeEqp).subscribe(eqpm => this.equipamentosFilter = eqpm.content)
    }
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
    this.ehTitulo = 'Cadastrar Equipamento';
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

    this.equipService.listar(0, 10).subscribe(eqpm => {
      this.equipamentosData = eqpm.content;

      this.firstEqp = 0
      this.sizeEqp = this.sizeEqpTemp
      this.rowsEqp = 10
    });
  }

  searchFilterWord(term: string) {
    this.equipService.acharNome(0, 10, term).subscribe(eqpm => {
      this.equipamentosFilter = eqpm.content
      this.equipamentosData = this.equipamentosFilter
      this.sizeEqpTemp = this.sizeEqp
      this.sizeEqp = eqpm.totalElements
    });
  }

  onKeyDown(event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      if (searchTerm != null || searchTerm != '') {
        this.searchFilterWord(searchTerm);
      }
    }
  }
  
  filterField(searchTerm: string) {
    if (searchTerm && (searchTerm != null || searchTerm != '')) {
      this.searchFilterWord(searchTerm);
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

  enviarFormSave() {
    this.equipService.criar(this.equipamentosCadast).subscribe({
      next: (data: any) => {
        this.equipamentosCadast = data;
        // this.goToRouteSave();
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Equipamento cadastrado com sucesso!', life: 3000 },
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
    this.equipService.atualizar(id, this.equipamentosEdit).subscribe({
      next: (data: any) => {
        this.equipamentosEdit = data;
        // this.goToRouteEdit(id);
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Equipamento editado com sucesso!', life: 3000 },
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
    this.router.navigate(['api/equipamentos']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/equipamentos', id]);
  }

  onSubmit() {
    if (this.form.valid && this.cadastrar) {
      this.equipamentosCadast = this.form.value;
      this.enviarFormSave();
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      // window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.equipamentosEdit = this.form.value;
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
    this.equipService.excluir(id)
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
          // console.log('Erro desconhecido:', err);
        }
      }
    });
  }

}
