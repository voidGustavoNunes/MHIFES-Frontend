import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, Time } from '@angular/common';
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
import { Evento, EventoHourData } from '../../models/evento.models';
import { EventoService } from '../../service/evento.service';
import { Local } from '../../models/local.models';
import { LocalService } from '../../service/local.service';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitch, InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MessagesModule } from 'primeng/messages';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { registerLocaleData } from '@angular/common';
import localePT from '@angular/common/locales/pt';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { CheckboxModule } from 'primeng/checkbox';
import { HorarioService } from '../../service/horario.service';
import { Horario } from '../../models/horario.models';
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
    MessagesModule,
    NgxMaskDirective,
    CheckboxModule
  ],
  templateUrl: './eventos-r.component.html',
  styleUrl: './eventos-r.component.scss',
  providers: [
    EventoService,
    LocalService,
    ConfirmationService,
    MessageService,
    provideNgxMask(),
    HorarioService
  ]
})
export class EventosRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  @ViewChild('dropdownLocal') dropdownLocal!: Dropdown;
  @ViewChild('dropdownHour') dropdownHour!: Dropdown;
  @ViewChild('switch') switch!: InputSwitch;
  @ViewChild('calendarEdit') calendarEdit!: Calendar;
  @ViewChild('calendarExtra') calendarExtra!: Calendar;

  eventosData: Evento[] = [];
  eventosFilter: Evento[] = [];
  eventosCadast: Evento[] = [];
  eventosEdit: Evento[] = [];
  eventoInfo!: Evento;

  locaisArray: Local[] = [];
  horariosArray: Horario[] = [];

  unsubscribe$!: Subscription;
  unsubscribe$LA!: Subscription;
  unsubscribe$Hor!: Subscription;

  form: FormGroup;

  ehTitulo: string = '';
  editar: boolean = false;
  cadastrar: boolean = false;
  
  visible: boolean = false;
  visibleEdit: boolean = false;
  visibleInfo: boolean = false;
  
  diasIntervalo: Date[] | null = null;
  
  disableIntervalo: boolean = true;
  disableFinal: boolean = true;
  disableSemana: boolean = false;
  
  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;
  txtFilter: string = 'Pesquisar evento';
  
  messages!: Message[];
  mss: boolean = false;
  
  checkedReplica: boolean = false;
  enableCheck: boolean = false;
  datasHour: EventoHourData[] = [];
  minDate!: Date;

  constructor(
    private eventService: EventoService,
    private locService: LocalService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private hourService: HorarioService,
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        dataEvento: [null, [Validators.required]],
        descricao: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(5000)]],
        horario: [null, [Validators.required]],
        local: [null, [Validators.required]]
      })
      // , { validator: this.verificarHoraFimMaiorQueInicio });
  }

  ngOnInit() {
    this.filterOptions = [
      {nome: 'Nome', id: 0},
      {nome: 'Data do Evento', id: 1},
      {nome: 'Hora de início', id: 2}
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

    this.unsubscribe$Hor = this.hourService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.horariosArray = data.sort((a:any, b:any) => (a.id > b.id) ? -1 : 1);
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
    this.unsubscribe$Hor.unsubscribe();
  }
  
  // verificarHoraFimMaiorQueInicio(formGroup: FormGroup) {
  //   const horaInicio = formGroup.get('horarioInicio')?.value;
  //   const horaFim = formGroup.get('horarioFim')?.value;

  //   if (horaInicio && horaFim && horaInicio >= horaFim) {
  //     formGroup.get('horarioFim')?.setErrors({ 'horaFimMenorQueInicio': true });
  //   } else {
  //     formGroup.get('horarioFim')?.setErrors(null);
  //   }
  // }
  
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
      nome: value.nome,
      dataEvento: value.dataEvento,
      descricao: value.descricao,
      horario: value.horario,
      local: value.local
    })
    this.dropdownLocal.writeValue(value.local);
    this.dropdownHour.writeValue(value.horario);

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
    this.calendarExtra.writeValue(null);
    this.switch.writeValue(null);

    this.diasIntervalo = [];
    this.datasHour = [];
  }
  
  hideDialog() {
    if(this.cadastrar) {
      this.visible = false;
    } else if(this.editar) {
      this.visibleEdit = false;
    }
    this.form.reset();
    this.dropdownLocal.writeValue(null);
    this.calendarEdit.writeValue(null);
    this.calendarExtra.writeValue(null);
    this.disableSemana = false;
  }

  updateCheckboxState() {
    let hora: Horario = this.form.get('horario')?.value;
    let ini: Date = this.form.get('dataEvento')?.value;

    if(ini && hora) {
      this.enableCheck = true;
    } else {
      this.enableCheck = false;
    }
  }

  verificarDataHour() {
    let hora: Horario = this.form.get('horario')?.value;
    
    this.diasIntervalo?.sort((a:Date, b:Date) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    this.diasIntervalo?.forEach(dtInt => {
      const existe = this.datasHour.some(item => item.dataEvento === dtInt);

      if (!existe) {
        this.datasHour.push({dataEvento: dtInt, horario: hora});
      }
    })
    this.datasHour = this.datasHour.filter(item => this.diasIntervalo?.includes(item.dataEvento));
    
    this.datasHour.sort((a:EventoHourData, b:EventoHourData) => {
      const dateA = new Date(a.dataEvento);
      const dateB = new Date(b.dataEvento);
      return dateA.getTime() - dateB.getTime();
    });
  }

  replicaIntervalo() {
    // let houI: Time = this.form.get('horarioInicio')?.value;
    // let houF: Time = this.form.get('horarioFim')?.value;
    // if(houI && houF) {
      // this.checkedReplica = !this.checkedReplica;
      console.log(this.checkedReplica)
    if(this.checkedReplica) {
      let ini: Date = this.form.get('dataEvento')?.value;
      this.minDate = new Date(ini);
      this.minDate.setDate(ini.getDate() + 1);
      this.minDate.setMonth(ini.getMonth());
      this.minDate.setFullYear(ini.getFullYear());
    }
    if(!this.checkedReplica) {
      this.diasIntervalo = [];
      this.datasHour = [];
    }
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
    if (this.selectedFilter?.id == 1) {
      this.txtFilter = '00/00/0000';
    } else if (this.selectedFilter?.id == 2) {
      this.txtFilter = '00:00';
    } else {
      this.txtFilter = 'Pesquisar evento';
    }
  }

  searchFilter0(term: string) {
    this.eventosData = this.eventosFilter.filter(evento => {
      if (evento.nome.toLowerCase().includes(term.toLowerCase())) {
        return evento;
      } else {
        return null;
      }
    })
  }

  searchFilter1(term: string) {
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

  // searchFilter2(term: string) {
  //   const compA = this.formatarTmStrTm(term);
  //   if(compA != null) {
  //     this.eventosData = this.eventosFilter.filter(evento => {
  //       const compB = this.formatarTmStrTm(evento.horarioInicio);
  //       if(compB != null) {
  //         if (compA.horas === compB.horas && compA.minutos === compB.minutos) {
  //           return evento;
  //         } else {
  //           return null;
  //         }
  //       } else {
  //         return null;
  //       }
  //     })
  //   }
  //   return null;
  // }

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
      this.filterField(searchTerm);
    }
  }
  
  filterField(searchTerm: string) {
    if (searchTerm != null || searchTerm != '') {
      if(this.selectedFilter) {
        if(this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
        if(this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
        // if(this.selectedFilter.id == 2) this.searchFilter2(searchTerm);
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
        // this.goToRouteSave();
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
        // this.goToRouteEdit(id);
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
    if(ini && !this.checkedReplica) {
      //  DATA INÍCIO
      this.eventosCadast = this.form.value;
      this.enviarFormSave();
    } else if(ini && this.checkedReplica) {
      //  DATA INÍCIO
      this.eventosCadast = this.form.value;
      this.enviarFormSave();
      
      //  DATAS INTERVALO
      this.datasHour.forEach((dt: EventoHourData) => {
        if(dt?.dataEvento.getTime() != ini?.getTime()) {
          this.form.patchValue({
            dataEvento: dt.dataEvento,
            horario: dt.horario
          });
          // this.mss = true;
          this.eventosCadast = this.form.value;
          this.enviarFormSave();
        }
      });

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


