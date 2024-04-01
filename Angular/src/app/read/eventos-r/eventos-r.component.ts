import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmationService, Message } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ScrollTopModule } from 'primeng/scrolltop';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { Evento } from '../../models/evento.models';
import { EventoService } from '../../service/evento.service';
import { Local } from '../../models/local.models';
import { LocalService } from '../../service/local.service';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitch, InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MessagesModule } from 'primeng/messages';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { Semana } from '../../models/share/semana.models';

@Component({
  selector: 'app-eventos-r',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
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
    DropdownModule,
    InputMaskModule,
    InputSwitchModule,
    OverlayPanelModule,
    MessagesModule
  ],
  templateUrl: './eventos-r.component.html',
  styleUrl: './eventos-r.component.scss',
  providers: [
    EventoService,
    LocalService,
    ConfirmationService
  ]
})
export class EventosRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  @ViewChild('dropdown') dropdown!: Dropdown;
  @ViewChild('switch') switch!: InputSwitch;
  @ViewChild('calendarExtra') calendarExtra!: Calendar;
  @ViewChild('dropdownExtra') dropdownExtra!: Dropdown;
  @ViewChild('calendario') calendario!: Calendar;

  eventosData: Evento[] = [];
  eventosFilter: Evento[] = [];
  eventosCadast: Evento[] = [];
  eventosEdit: Evento[] = [];
  eventoInfo!: Evento;

  locaisArray: Local[] = [];

  unsubscribe$!: Subscription;
  unsubscribe$LA!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  editar: boolean = false;
  cadastrar: boolean = false;
  
  visible: boolean = false;
  visibleExtra: boolean = false;
  visibleEdit: boolean = false;
  visibleInfo: boolean = false;
  
  valor: boolean = false;
  opcaoSemana: Semana[] = [];
  selectedSemana!: Semana;
  diasIntervalo: Date[] = [];
  dataFim!: Date;

  disableDrop: boolean = true;
  disableSwit: boolean = true;

  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;

  messages!: Message[];
  mss: boolean = false;

  constructor(
    private eventService: EventoService,
    private locService: LocalService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        dataEvento: [null, Validators.required],
        descricao: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        horarioInicio: [null, [Validators.required]],
        horarioFim: [null, Validators.required],
        local: [null, Validators.required]
      }, { validator: this.verificarHoraFimMaiorQueInicio });
  }

  ngOnInit() {
    this.opcaoSemana = [
      { nome: 'Domingo', code: 0 },
      { nome: 'Segunda-feira', code: 1 },
      { nome: 'Terça-feira', code: 2 },
      { nome: 'Quarta-feira', code: 3 },
      { nome: 'Quinta-feira', code: 4 },
      { nome: 'Sexta-feira', code: 5 },
      { nome: 'Sábado', code: 6 }
    ];

    this.filterOptions = [
      {nome: 'Ano do Evento', id: 0},
      {nome: 'Descrição', id: 1},
      {nome: 'Nome do local', id: 2}
    ];

    this.unsubscribe$ = this.eventService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.eventosData = data;
        this.eventosFilter = this.eventosData;
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de eventos não encontrados.' },
        ];
      }
    });

    this.unsubscribe$LA = this.locService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.locaisArray = data.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de locais não encontrados.' },
        ];
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
    this.unsubscribe$LA.unsubscribe();
  }
  
  validarDatas() {
    const dataEvento = this.form.get('dataEvento')?.value;

    if (dataEvento && this.dataFim && new Date(this.dataFim) < new Date(dataEvento)) {
      this.form.get('dataEvento')?.setErrors({ 'invalidEndDate': true });
    } else {
      this.form.get('dataEvento')?.setErrors(null);
    }
  }
  
  verificarHoraFimMaiorQueInicio(formGroup: FormGroup) {
    const horaInicio = formGroup.get('horarioInicio')?.value;
    const horaFim = formGroup.get('horarioFim')?.value;

    if (horaInicio && horaFim && horaInicio >= horaFim) {
      formGroup.get('horarioFim')?.setErrors({ 'horaFimMenorQueInicio': true });
    } else {
      formGroup.get('horarioFim')?.setErrors(null);
    }
  }
  
  showInfoDialog(value: Evento) {
    this.visibleInfo = true;
    this.eventoInfo = value;
  }

  showEditDialog(value: Evento) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Evento'
    this.visibleEdit = true;
    this.cadastrar = false;
    this.editar = true;
    this.form.patchValue({
      id: value.id,
      dataEvento: value.dataEvento,
      descricao: value.descricao,
      horarioInicio: value.horarioInicio,
      horarioFim: value.horarioFim,
      local: value.local
    })
    this.dropdown.writeValue(value.local);
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Evento';
    this.visible = true;
    this.cadastrar = true;
    this.editar = false;
    this.dropdown.writeValue(null);
    this.calendario.writeValue(null);
    this.switch.writeValue(null);

    this.valor = false;
    this.selectedSemana = { nome: '', code: 0 };
    this.diasIntervalo = [];
    this.dataFim = new Date();

    this.dropdownExtra.writeValue(null);
    this.calendarExtra.writeValue(null);
    this.calendario.writeValue(null);
  }
  
  hideDialog() {
    if(this.cadastrar) {
      if(this.visibleExtra) {
        this.visibleExtra = false;
        this.valor = false;
        this.dropdownExtra.writeValue(null);
        this.calendarExtra.writeValue(null);
        this.calendario.writeValue(null);
      }
      this.visible = false;
      this.form.reset();
      this.dropdown.writeValue(null);
      this.calendario.writeValue(null);
      this.switch.writeValue(null);
    } else if(this.editar) {
      this.visibleEdit = false;
      this.form.reset();
      this.dropdown.writeValue(null);
    }
  }

  handleChange() {
    if (this.valor) {
      this.visibleExtra = true;
    } else {
      this.visibleExtra = false;
    }
  }
  
  onClickHide() {
    if(this.visibleExtra) this.visibleExtra = false;
  }

  onDropdownChange() {
    let ini: Date = this.form.get('dataEvento')?.value;
    if(ini && this.dataFim) {
      this.disableDrop = false;
      this.atualizarDiasSemana(this.selectedSemana.code);
    } else {
      this.disableDrop = true;
    }
  }

  onDateIniSelect() {
    let ini: Date = this.form.get('dataEvento')?.value;
    
    if(ini) {
      this.disableSwit = false;
    } else {
      this.disableSwit = true;
    }
  }

  atualizarDiasSemana(code: number) {
    let ini: Date = this.form.get('dataEvento')?.value;
    let fim: Date = this.dataFim;

    if(ini && fim) {
      this.diasIntervalo = this.calcularDiasSemana(ini, fim, code);
      this.calendario.writeValue(this.diasIntervalo);
    }
  }

  calcularDiasSemana(dtIni: Date, dtFim: Date, diaSemana: number): Date[] {
    let diasSemana: Date[] = [];
    let dataTemp = new Date(dtIni);

    dataTemp.setDate(dataTemp.getDate() + (diaSemana - dataTemp.getDay() + 7) % 7);

    while (dataTemp <= dtFim) {
      if (dataTemp >= dtIni && dataTemp <= dtFim) {
        diasSemana.push(new Date(dataTemp));
      }
      dataTemp.setDate(dataTemp.getDate() + 7);
    }

    if (!diasSemana.some(dia => dia.getTime() === dtIni.getTime())) {
      diasSemana.push(new Date(dtIni));
    }
    if (!diasSemana.some(dia => dia.getTime() === dtFim.getTime())) {
      diasSemana.push(new Date(dtFim));
    }

    return diasSemana;
  }
  
  limparFilter(){
    const inputElement = this.inputSearch.nativeElement.value
    if (inputElement) {
      this.inputSearch.nativeElement.value = '';
    }
    this.selectedFilter = {} as FiltrarPesquisa;
    this.eventosData = this.eventosFilter;
  }

  searchFilter0(term: string) {
    this.eventosData = this.eventosFilter.filter(evento => {
      const searchTermAsNumber = parseInt(term);
      if (!isNaN(searchTermAsNumber)) {
        const anos = new Date(evento.dataEvento).getFullYear();
        if (anos == searchTermAsNumber) {
          return evento;
        } else {
          return null;
        }
      } else {
        return null;
      }
    })
  }

  searchFilter1(term: string) {
    this.eventosData = this.eventosFilter.filter(evento => {
      if (evento.descricao.toLowerCase().includes(term.toLowerCase())) {
        return evento;
      } else {
        return null;
      }
    })
  }

  searchFilter2(term: string) {
    this.eventosData = this.eventosFilter.filter(evento => {
      if (evento.local.nome.toLowerCase().includes(term.toLowerCase())) {
        return evento;
      } else {
        return null;
      }
    })
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
          { severity: 'error', summary: 'Cancelado', detail: 'Exclusão cancelada.' },
        ];
      }
    });
  }

  enviarFormSave() {
    this.eventService.criar(this.eventosCadast).subscribe({
      next: (data: any) => {
        this.eventosCadast = data;
        this.goToRouteSave();
        if(this.mss) {
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Evento cadastrado com sucesso!' },
          ];
        }
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Cadastro não enviado.' },
        ];
      }
    });
  }

  enviarFormEdit(id: number) {
    this.eventService.atualizar(id, this.eventosEdit).subscribe({
      next: (data: any) => {
        this.eventosEdit = data;
        this.goToRouteEdit(id);
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Evento editado com sucesso!' },
        ];
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Edição não enviada.' },
        ];
      }
    });
  }

  goToRouteSave() {
    this.router.navigate(['api/eventos']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/eventos', id]);
  }

  onSubmit() {
    if (this.form.valid && this.cadastrar) {
      if(this.valor) {
        this.conditionCreateSave();
      } else {
        this.eventosCadast = this.form.value;
        this.enviarFormSave();
      }
      this.mss = false;
      this.visible = false;
      this.visibleExtra = false;
      this.form.reset();
      this.ngOnInit();
      window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.eventosEdit = this.form.value;
      this.enviarFormEdit(this.form.get('id')?.value);
      this.visibleEdit = false;
      this.form.reset();
      this.ngOnInit();
      window.location.reload();
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha os campos!' },
      ];
    }
  }

  conditionCreateSave() {
    if(this.diasIntervalo) {
      let ini: Date = this.form.get('dataEvento')?.value;
      
      //  DATA INÍCIO
      this.eventosCadast = this.form.value;
      this.enviarFormSave();
      
      //  DATAS INTERVALO
      this.diasIntervalo.forEach((dt: Date) => {
        if(dt != ini && dt != this.dataFim) {
          this.form.patchValue({
            dataEvento: dt
          });
          this.eventosCadast = this.form.value;
          this.enviarFormSave();
        }
      });

      // DATA FIM
      this.form.patchValue({
        dataEvento: this.dataFim
      });
      this.mss = true;
      this.eventosCadast = this.form.value;
      this.enviarFormSave();
    } else {
      //  DATA INÍCIO
      this.eventosCadast = this.form.value;
      this.enviarFormSave();

      // DATA FIM
      this.form.patchValue({
        dataEvento: this.dataFim
      });
      this.eventosCadast = this.form.value;
      this.mss = true;
      this.enviarFormSave();
    }
  }

  deletarID(id: number) {
    this.eventService.excluir(id)
    .subscribe({
      next: (data: any) => {
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Registro deletado com sucesso!' },
        ];
        this.ngOnInit();
        window.location.reload();
      },
      error: (err: any) => {
        if (err.status) {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar registro.' },
          ];
        } else {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Erro desconhecido ' + err },
          ];
        }
      }
    });
  }

}


