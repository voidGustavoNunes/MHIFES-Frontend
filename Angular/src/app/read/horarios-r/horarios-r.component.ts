import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Horario } from '../../models/postgres/horario.models';
import { HorarioService } from '../../service/horario.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { PaginatorState } from 'primeng/paginator';
import { Page } from '../../models/share/page.models';

@Component({
  selector: 'app-horarios-r',
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
  templateUrl: './horarios-r.component.html',
  styleUrl: './horarios-r.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    HorarioService,
    provideNgxMask()
  ]
})
export class HorariosRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;

  horariosData: Horario[] = [];
  horariosFilter: Horario[] = [];
  horariosCadast: Horario[] = [];
  horariosEdit: Horario[] = [];

  unsubscribe$!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;

  messages!: Message[];

  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;
  txtFilter: string = 'Pesquisar horário';

  firstHors: number = 0;
  pageHours: number = 0;
  rowsHors: number = 10;
  sizeHors: number = 0;

  sizeHorsTemp: number = 0;

  horasPageData!: Page<Horario>;
  
  checkOptionsSelected: Horario[] = []

  constructor(
    private hourService: HorarioService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService
  ) {
    this.form = this.formBuilder.group({
      id: [null],
      horaInicio: [null, [Validators.required]],
      horaFim: [null, [Validators.required]]
    }, { validator: this.verificarHoraFimMaiorQueInicio });
  }

  ngOnInit() {
    this.filterOptions = [
      { nome: 'Hora de início', id: 0 },
      { nome: 'Hora de fim', id: 1 },
    ];

    this.unsubscribe$ = this.hourService.listar(0, 10)
      .subscribe({
        next: (itens: any) => {
          this.horasPageData = itens;
          this.sizeHors = this.horasPageData.totalElements;

          this.horariosData = this.horasPageData.content;
          this.horariosData.sort((a: Horario, b: Horario) => {
            let hAi = this.formatMiliss(a.horaInicio)
            let hBi = this.formatMiliss(b.horaFim)

            if (hAi < hBi) {
              return -1;
            } else if (hAi > hBi) {
              return 1;
            } else {
              return 0;
            }
          });
          this.pageFilter()
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: err, sticky: true },
          ];
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
  }

  onPageChange(event: PaginatorState) {
    if (event.first !== undefined && event.rows !== undefined && event.page !== undefined) {
      this.firstHors = event.first;
      this.rowsHors = event.rows;
      this.pageHours = event.page;
      this.checkOptionsSelected = []
      this.listarPage()
    }
  }

  listarPage() {
    this.hourService.listar(this.pageHours, this.rowsHors)
      .subscribe((itens: any) => {
        this.horasPageData = itens;
        this.horariosData = this.horasPageData.content;
        this.horariosData.sort((a: Horario, b: Horario) => {
          let hAi = this.formatMiliss(a.horaInicio)
          let hBi = this.formatMiliss(b.horaFim)

          if (hAi < hBi) {
            return -1;
          } else if (hAi > hBi) {
            return 1;
          } else {
            return 0;
          }
        });
      });
  }

  pageFilter() {
    if (this.sizeHors > 0) {
      this.hourService.listar(0, this.sizeHors).subscribe(hors => this.horariosFilter = hors.content)
    }
  }

  verificarHoraFimMaiorQueInicio(formGroup: FormGroup) {
    const horaInicio = formGroup.get('horaInicio')?.value;
    const horaFim = formGroup.get('horaFim')?.value;

    if (horaInicio && horaFim && horaInicio >= horaFim) {
      formGroup.get('horaFim')?.setErrors({ 'horaFimMenorQueInicio': true });
    } else {
      formGroup.get('horaFim')?.setErrors(null);
    }
  }

  showEditDialog(value: Horario) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Horário'
    this.visible = true;
    this.cadastrar = false;
    this.editar = true;
    this.form.setValue({
      id: value.id,
      horaInicio: value.horaInicio,
      horaFim: value.horaFim
    })
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Horário';
    this.visible = true;
    this.cadastrar = true;
    this.editar = false;
  }

  hideDialog() {
    this.visible = false;
    this.form.reset();
  }

  limparFilter() {
    const inputElement = this.inputSearch.nativeElement.value
    if (inputElement) {
      this.inputSearch.nativeElement.value = '';
    }
    this.selectedFilter = {} as FiltrarPesquisa;

    this.hourService.listar(0, 10).subscribe(hors => {
      this.horariosData = hors.content;

      this.firstHors = 0
      this.sizeHors = this.sizeHorsTemp
      this.rowsHors = 10
    });
  }

  searchFilter0(term: string) {
    this.hourService.acharTimeInicio(0, 10, term).subscribe(hors => {
      this.horariosFilter = hors.content
      this.horariosData = this.horariosFilter
      this.sizeHorsTemp = this.sizeHors
      this.sizeHors = hors.totalElements
    })
  }

  searchFilter1(term: string) {
    this.hourService.acharTimeFim(0, 10, term).subscribe(hors => {
      this.horariosFilter = hors.content
      this.horariosData = this.horariosFilter
      this.sizeHorsTemp = this.sizeHors
      this.sizeHors = hors.totalElements
    })
  }

  onKeyDown(event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      this.filterField(searchTerm);
    }
  }

  filterField(searchTerm: string) {
    if (searchTerm && (searchTerm != null || searchTerm != '')) {
      if (this.selectedFilter) {
        if (this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
        if (this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
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

  updateMask() {
    if (this.selectedFilter?.id == 0 || this.selectedFilter?.id == 1) {
      this.txtFilter = '00:00';
    } else {
      this.txtFilter = 'Pesquisar horário';
    }
  }

  formatarHora(tempo: any) {
    const partes = tempo.split(':');
    const horas = partes[0];
    const minutos = partes[1];

    return `${horas}h ${minutos}min`;
  }

  formatarTmStrTm(tempo: any) {
    if (tempo) {
      const partes = tempo.split(':');
      const horas = parseInt(partes[0], 10);
      const minutos = parseInt(partes[1], 10) - 1;

      if (!isNaN(horas) && !isNaN(minutos) && horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59) {
        return { horas, minutos };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  formatMiliss(tempo: any) {
    if (tempo) {
      const partes = tempo.split(':');
      const horas = parseInt(partes[0], 10);
      const minutos = parseInt(partes[1], 10);
      const milissegundos = (horas * 60 + minutos) * 60000;
      return milissegundos;
    }
    return 0;
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

  confirm3(event: Event, codes: Horario[]) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Deseja excluir esses registros?',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        codes.forEach(alno => this.deletarID(alno.id));
      },
      reject: () => {
        this.messages = [
          { severity: 'info', summary: 'Cancelado', detail: 'Exclusão cancelada.', life: 3000 },
        ];
      }
    });
  }

  enviarFormSave() {
    this.hourService.criar(this.horariosCadast).subscribe({
      next: (data: any) => {
        this.horariosCadast = data;
        // this.goToRouteSave();
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Horário cadastrado com sucesso!', life: 3000 },
        ];
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: err, sticky: true },
        ];
      }
    });
  }

  enviarFormEdit(id: number) {
    this.hourService.atualizar(id, this.horariosEdit).subscribe({
      next: (data: any) => {
        this.horariosEdit = data;
        // this.goToRouteEdit(id);
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Horário editado com sucesso!', life: 3000 },
        ];
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: err, sticky: true },
        ];
      }
    });
  }

  onSubmit() {
    if (this.form.valid && this.cadastrar) {
      this.horariosCadast = this.form.value;
      this.enviarFormSave()
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      // window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.horariosEdit = this.form.value;
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
    this.hourService.excluir(id)
      .subscribe({
        next: (data: any) => {
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Registro deletado com sucesso!', life: 3000 },
          ];
          this.ngOnInit();
        },
        error: (err: any) => {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: err, sticky: true },
          ];
        }
      });
  }


  badgeOptionExclui(event: Event) {
    if(this.checkOptionsSelected.length > 0) {
      this.confirm3(event, this.checkOptionsSelected)
    }
  }
}
