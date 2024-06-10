import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { AlunoService } from '../../../service/aluno.service';
import { Aluno } from '../../../models/postgres/aluno.models';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FiltrarPesquisa } from '../../../models/share/filtrar-pesquisa.models';
import { PrimeNgImportsModule } from '../../../shared/prime-ng-imports/prime-ng-imports.module';
import { Page, PageEvent } from '../../../models/share/page.models';
import { PaginatorState } from 'primeng/paginator';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-alunos-r',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMaskDirective,
    PrimeNgImportsModule
  ],
  templateUrl: './alunos-r.component.html',
  styleUrl: './alunos-r.component.scss',
  providers: [
    AlunoService,
    ConfirmationService,
    MessageService,
    provideNgxMask()
  ]
})

export class AlunosRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  @ViewChild('barcodeImage', { static: false }) barcodeImage!: ElementRef;

  alunosData: Aluno[] = [];
  alunosFilter: Aluno[] = [];
  alunosCadast: Aluno[] = [];
  alunosEdit!: Aluno;
  
  unsubscribe$!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;
  
  messages!: Message[];
  mss: boolean = false;
  
  alunoInfo!: Aluno;
  visibleInfo: boolean = false;
  visibleBarcode: boolean = false;
  
  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;

  firstAln: number = 0;
  pageAln: number = 0;
  rowsAln: number = 10;
  sizeAln: number = 0;

  alunosPageData!: Page<Aluno>;

  constructor(
    private alunService: AlunoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        matricula: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        curso: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]]
      });
  }

  ngOnInit() {
    this.filterOptions = [
      {nome: 'Nome', id: 0},
      {nome: 'Matrícula', id: 1}
    ];

    this.unsubscribe$ = this.alunService.listar(0,10)
    .subscribe({
      next: (itens:any) => {
        this.alunosPageData = itens;
        this.sizeAln = this.alunosPageData.totalElements;
        
        this.alunosData = this.alunosPageData.content;
        this.alunosData.sort((a:any, b:any) => (a.nome < b.nome ) ? -1 : 1);
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
      this.firstAln = event.first;
      this.rowsAln = event.rows;
      this.pageAln = event.page;
      this.listarPage()
    }
  }

  listarPage() {
    this.alunService.listar(this.pageAln, this.rowsAln)
    .subscribe((itens:any) => {
        this.alunosPageData = itens;
        this.alunosData = this.alunosPageData.content;
        this.alunosData.sort((a:any, b:any) => (a.nome < b.nome ) ? -1 : 1);
      });
  }

  pageFilter() {
    if(this.sizeAln > 0) {
      this.alunService.listar(0, this.sizeAln).subscribe(alno => this.alunosFilter = alno.content)
    }
  }

  showInfoDialog(value: Aluno) {
    this.visibleInfo = true;
    this.alunoInfo = value;
  }

  showEditDialog(value: Aluno) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Aluno'
    this.visible = true;
    this.visibleInfo = false;
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
    this.selectedFilter = {} as FiltrarPesquisa;
    this.alunosData = this.alunosFilter;
  }

  searchFilter0(term: string) {
    this.alunosData = this.alunosFilter.filter(el => {
      if (el.nome.toLowerCase().includes(term.toLowerCase())) {
        return el;
      } else {
        return null;
      }
    })
  }

  searchFilter1(term: string) {
    this.alunosData = this.alunosFilter.filter(el => {
      if (el.matricula.toLowerCase().includes(term.toLowerCase())) {
        return el;
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
    if (searchTerm && (searchTerm != null || searchTerm != '')) {
      if(this.selectedFilter) {
        if(this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
        if(this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
      } else {
        this.messages = [
          { severity: 'warn', summary: 'Atenção', detail: 'Selecione um filtro!', life: 3000 },
        ];
      }
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
    this.alunService.criar(this.alunosCadast).subscribe({
      next: (data: any) => {
        this.alunosCadast = data;
        // this.goToRouteSave();
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Aluno cadastrado com sucesso!', life: 3000 },
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
    this.alunService.atualizar(id, this.alunosEdit).subscribe({
      next: (data: any) => {
        this.alunosEdit = data;
        // this.goToRouteEdit(id);
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Aluno editado com sucesso!', life: 3000 },
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
      // window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.alunosEdit = this.form.value;
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
    this.alunService.excluir(id)
    .subscribe({
      next: (data: any) => {
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Registro deletado com sucesso!', life: 3000 },
        ];
        this.ngOnInit();
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

  generateBarcode(matricula: string) {
    if (!matricula) {
      return;
    }
    
    this.visibleBarcode = true;

    // Aguarde a renderização do popup para gerar o código de barras
    setTimeout(() => {
      const barcodeElement = this.barcodeImage.nativeElement;
      JsBarcode(barcodeElement, matricula, {
        format: 'CODE128',
        lineColor: '#000000',
        width: 2,
        height: 100,
        displayValue: true
      });
    }, 0);
  }

  hideBarcodeDialog() {
    this.visibleBarcode = false;
  }

  printBarcode() {
    // Obtenha o elemento que contém o código de barras
    const barcodeElement = this.barcodeImage.nativeElement;

    // Crie uma nova janela de impressão
    const printWindow = window.open('', '_blank', 'width=300,height=300');

    if (printWindow) {
        printWindow.document.write('<html><head><title>Código de Barras</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            body {
                margin: 0;
                padding: 0;
            }
            .barcode-container {
                display: grid;
                grid-template-columns: repeat(3, 3.2cm);
                grid-auto-rows: 2cm;
                gap: 0.35cm; /* Ajuste do espaçamento entre etiquetas */
                margin:8 7;
                padding: 0;
            }
            .barcode-container img {
                width: 100%;
                height: auto;
                margin: 0;
                padding: 0;
            }
        `);
        printWindow.document.write('</style></head><body>');
        
        // Adicione múltiplas imagens do código de barras à janela de impressão
        printWindow.document.write('<div class="barcode-container">');
        for (let i = 0; i < 3; i++) { // Repita três vezes para preencher uma linha
            printWindow.document.write('<img src="' + barcodeElement.src + '">');
        }
        printWindow.document.write('</div>');

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        // Espere o conteúdo ser carregado na janela de impressão antes de iniciar a impressão
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close(); // Feche a janela de impressão após a impressão
        };
    }
}

}
