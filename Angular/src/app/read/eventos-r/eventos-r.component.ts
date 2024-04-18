import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
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
import { registerLocaleData } from '@angular/common';
import localePT from '@angular/common/locales/pt';
import { DiaSemana, Horario } from '../../models/horario.models';
import { HorarioService } from '../../service/horario.service';
registerLocaleData(localePT);

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
    HorarioService,
    ConfirmationService,
    MessageService
  ]
})
export class EventosRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  @ViewChild('dropdownHora') dropdownHora!: Dropdown;
  @ViewChild('dropdownLocal') dropdownLocal!: Dropdown;
  @ViewChild('switch') switch!: InputSwitch;
  @ViewChild('calendarEdit') calendarEdit!: Calendar;
  @ViewChild('calendarExtra') calendarExtra!: Calendar;
  @ViewChild('calendario') calendario!: Calendar;

  eventosData: Evento[] = [];
  eventosFilter: Evento[] = [];
  eventosCadast: Evento[] = [];
  eventosEdit: Evento[] = [];
  eventoInfo!: Evento;

  locaisArray: Local[] = [];
  horariosArray: Horario[] = [];

  unsubscribe$!: Subscription;
  unsubscribe$LA!: Subscription;
  unsubscribe$HR!: Subscription;

  form: FormGroup;

  ehTitulo: string = '';
  editar: boolean = false;
  cadastrar: boolean = false;
  
  visible: boolean = false;
  visibleEdit: boolean = false;
  visibleInfo: boolean = false;
  
  opcaoSemana: Semana[] = [];
  diasIntervalo: Date[] | null = null;
  dataFim: Date | null = null;

  disableIntervalo: boolean = true;
  disableFinal: boolean = true;
  disableSemana: boolean = false;

  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;
  txtFilter: string = 'Pesquisar evento';

  messages!: Message[];
  mss: boolean = false;

  constructor(
    private eventService: EventoService,
    private locService: LocalService,
    private horasService: HorarioService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        dataEvento: [null, [Validators.required]],
        descricao: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(5000)]],
        horario: [null, [Validators.required]],
        local: [null, [Validators.required]]
      });
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
      {nome: 'Data do Evento', id: 0},
      {nome: 'Descrição', id: 1},
      {nome: 'Nome do local', id: 2},
      {nome: 'Ano do Evento', id: 3},
      {nome: 'Hora de início', id: 4}
    ];

    this.unsubscribe$ = this.eventService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.eventosData = data;
        
        data.sort((a: Evento, b: Evento) => {
          const dateA = new Date(a.dataEvento);
          const dateB = new Date(b.dataEvento);
          return dateB.getTime() - dateA.getTime();
        });
        
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

    this.unsubscribe$HR = this.horasService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.horariosArray = data.sort((a: Horario, b: Horario) => {
          const timeA = a.horaInicio.toString();
          const timeB = b.horaInicio.toString();
          return timeA.localeCompare(timeB);
        });
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de horários não encontrados.' },
        ];
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
    this.unsubscribe$LA.unsubscribe();
    this.unsubscribe$HR.unsubscribe();
  }
  
  validarDatas() {
    const dataEvento = this.form.get('dataEvento')?.value;

    if (dataEvento && this.dataFim && new Date(this.dataFim) < new Date(dataEvento)) {
      this.form.get('dataEvento')?.setErrors({ 'invalidEndDate': true });
      this.disableSemana = false;
    } else {
      this.form.get('dataEvento')?.setErrors(null);
      this.disableSemana = true;
    }
  }
  
  showInfoDialog(value: Evento) {
    this.visibleInfo = true;
    this.eventoInfo = value;
  }

  showEditDialog(value: Evento, dtEv: string) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Evento'
    this.visibleEdit = true;
    this.visibleInfo = false;
    this.disableSemana = true;
    this.cadastrar = false;
    this.editar = true;
    this.form.patchValue({
      id: value.id,
      dataEvento: value.dataEvento,
      descricao: value.descricao,
      horario: value.horario,
      local: value.local
    })
    this.dropdownLocal.writeValue(value.local);
    this.dropdownHora.writeValue(value.horario);

    const eventoData = this.formatarDtStrDt(dtEv);
    this.calendarEdit.writeValue(eventoData);
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Evento';
    this.visible = true;
    this.visibleInfo = false;
    this.disableSemana = false;
    this.cadastrar = true;
    this.editar = false;
    this.dropdownLocal.writeValue(null);
    this.dropdownHora.writeValue(null);
    this.calendario.writeValue(null);
    this.calendarExtra.writeValue(null);
    this.switch.writeValue(null);

    this.diasIntervalo = [];
    this.dataFim = null;
  }
  
  hideDialog() {
    if(this.cadastrar) {
      this.visible = false;
    } else if(this.editar) {
      this.visibleEdit = false;
    }
    this.form.reset();
    this.dropdownHora.writeValue(null);
    this.dropdownLocal.writeValue(null);
    this.calendario.writeValue(null);
    this.calendarEdit.writeValue(null);
    this.calendarExtra.writeValue(null);
    this.dataFim = null;
    this.disableSemana = false;
  }

  formatSemanaStr(semana: DiaSemana) {
    let selectedSemana!: Semana;
    if(semana.toString() == "DOMINGO") {
      selectedSemana = this.opcaoSemana[0];
    } else if(semana.toString() == "SEGUNDA") {
      selectedSemana = this.opcaoSemana[1];
    } else if(semana.toString() == "TERCA") {
      selectedSemana = this.opcaoSemana[2];
    } else if(semana.toString() == "QUARTA") {
      selectedSemana = this.opcaoSemana[3];
    } else if(semana.toString() == "QUINTA") {
      selectedSemana = this.opcaoSemana[4];
    } else if(semana.toString() == "SEXTA") {
      selectedSemana = this.opcaoSemana[5];
    } else if(semana.toString() == "SABADO") {
      selectedSemana = this.opcaoSemana[6];
    }

    return selectedSemana;
  }
  
  onDropdownChange() {
    let ini: Date = this.form.get('dataEvento')?.value;
    let semana: Horario = this.form.get('horario')?.value;
    if(ini && this.dataFim && semana) {
      let selectedSemana: Semana = this.formatSemanaStr(semana.diaSemana);
      if(selectedSemana) {
        this.atualizarDiasSemana(selectedSemana.code);
        this.disableIntervalo = false;
      } else {
        this.disableIntervalo = true;
        this.diasIntervalo = null;
      }
    } else {
      this.disableIntervalo = true;
      this.diasIntervalo = null;
    }
  }

  verificarDataFinal() {
    let ini: Date = this.form.get('dataEvento')?.value;
    let final: Date | null = null;
    
    if (this.diasIntervalo !== null) {
      this.diasIntervalo.sort((a, b) => a.getTime() - b.getTime());

      this.diasIntervalo.forEach(di => {
        if (this.dataFim !== null && di > this.dataFim) {
          final = di;
        }
        if(di < ini) {
          this.form.patchValue({
            dataEvento: di
          })
        }
      })

      if (final) {
        this.dataFim = final;
      }
      this.onDropdownChange();
    }
  }

  onDateIniSelect() {
    let ini: Date = this.form.get('dataEvento')?.value;
    let final: Date | null = this.dataFim;
    
    if(ini && (final === undefined || final === null)) {
      this.disableFinal = false;
      this.disableSemana = true;
      this.dataFim = ini;
    } else if(ini && final) {
      this.disableFinal = false;
      this.disableSemana = true;
    } else {
      this.disableFinal = true;
      this.disableSemana = false;
    }
  }

  atualizarDiasSemana(code: number) {
    let ini: Date = this.form.get('dataEvento')?.value;
    let fim: Date | null = this.dataFim;

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

  updateMask() {
    if (this.selectedFilter?.id == 0) {
      this.txtFilter = '00/00/0000';
    } else if (this.selectedFilter?.id == 4) {
      this.txtFilter = '00:00';
    } else {
      this.txtFilter = 'Pesquisar evento';
    }
  }

  searchFilter0(term: string) {
    const dateTerm = this.formatarDtStrDt(term);
    
    if (dateTerm instanceof Date && !isNaN(dateTerm.getTime())) {
      this.eventosData = this.eventosFilter.filter(evento => {
        const tiparDT = evento.dataEvento;
        if (typeof tiparDT === 'string') {
          const tiparFormat = this.formatarDatas(tiparDT);
          const searchTerm = this.formatarDtStrDt(tiparFormat);
          
          if (dateTerm.getTime() === searchTerm?.getTime()) {
            return evento;
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

  searchFilter3(term: string) {
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

  searchFilter4(term: string) {
    const compA = this.formatarTmStrTm(term);
    if(compA != null) {
      this.eventosData = this.eventosFilter.filter(evento => {
        const compB = this.formatarTmStrTm(evento.horario.horaInicio);
        if(compB != null) {
          if (compA == compB) {
            return evento;
          } else {
            return null;
          }
        } else {
          return null;
        }
      })
    } else {
      return null;
    }
    return null;
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

  formatarHora(tempo: any) {
    if (typeof tempo === 'string') {
      const partes = tempo.split(':');
      const horas = partes[0];
      const minutos = partes[1];
      const segundos = partes[2];

      return `${horas}h ${minutos}min`;
    }
    return null;
  }

  formatarTmStrTm(tempo: any) {
    if(tempo) {
      const partes = tempo.split(':');
      const horas =  parseInt(partes[0], 10);
      const minutos =  parseInt(partes[1], 10) - 1;
      
      if (!isNaN(horas) && !isNaN(minutos) && horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59) {
        return { horas, minutos };
      } else {
        return null;
      }
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
          if(this.selectedFilter.id == 3) this.searchFilter3(searchTerm);
          if(this.selectedFilter.id == 4) this.searchFilter4(searchTerm);
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
        if(this.selectedFilter.id == 3) this.searchFilter3(searchTerm);
        if(this.selectedFilter.id == 4) this.searchFilter4(searchTerm);
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
        this.ngOnInit();
        if(this.mss) {
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Evento cadastrado com sucesso!', life: 3000 },
          ];
        }
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Cadastro não enviado.', life: 3000 },
        ];
      }
    });
  }

  enviarFormEdit(id: number) {
    this.eventService.atualizar(id, this.eventosEdit).subscribe({
      next: (data: any) => {
        this.eventosEdit = data;
        this.goToRouteEdit(id);
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Evento editado com sucesso!', life: 3000 },
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
    this.router.navigate(['api/eventos']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/eventos', id]);
  }

  onSubmit() {
    if (this.form.valid && this.cadastrar) {
      this.conditionCreateSave();
      this.mss = false;
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      // window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.eventosEdit = this.form.value;
      this.enviarFormEdit(this.form.get('id')?.value);
      this.visibleEdit = false;
      this.form.reset();
      this.ngOnInit();
      // window.location.reload();
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha os campos!', life: 3000 },
      ];
    }
  }

  conditionCreateSave() {
    let ini: Date = this.form.get('dataEvento')?.value;
    if(this.diasIntervalo) {
      //  DATA INÍCIO
      this.eventosCadast = this.form.value;
      this.enviarFormSave();
      
      //  DATAS INTERVALO
      // this.formatarDtIntervalo();
      this.diasIntervalo.forEach((dt: Date) => {
        if(dt?.getTime() != ini?.getTime() && dt?.getTime() != this.dataFim?.getTime()) {
          this.form.patchValue({
            dataEvento: dt
          });
          this.eventosCadast = this.form.value;
          this.enviarFormSave();
        }
      });

      // DATA FIM
      if(ini?.getTime() != this.dataFim?.getTime()) {
        this.form.patchValue({
          dataEvento: this.dataFim
        });
        this.eventosCadast = this.form.value;
        this.enviarFormSave();
      }
      this.mss = true;
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha os campos!', life: 3000 },
      ];
    }
  }
  
  deletarID(id: number) {
    this.eventService.excluir(id)
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
            { severity: 'error', summary: 'Erro', detail: 'Erro desconhecido ' + err },
          ];
        }
      }
    });
  }

}


