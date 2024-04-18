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
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitch, InputSwitchModule } from 'primeng/inputswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MessagesModule } from 'primeng/messages';
import { FiltrarPesquisa } from '../../models/share/filtrar-pesquisa.models';
import { Semana } from '../../models/share/semana.models';
import { registerLocaleData } from '@angular/common';
import localePT from '@angular/common/locales/pt';
import { HorarioService } from '../../service/horario.service';
import { DiaSemana, Horario } from '../../models/horario.models';
registerLocaleData(localePT);

@Component({
  selector: 'app-horarios-r',
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
    DropdownModule,
    ScrollTopModule,
    ConfirmPopupModule,
    InputMaskModule,
    InputSwitchModule,
    OverlayPanelModule,
    MessagesModule
  ],
  templateUrl: './horarios-r.component.html',
  styleUrl: './horarios-r.component.scss',
  providers: [
    HorarioService,
    ConfirmationService,
    MessageService
  ]
})
export class HorariosRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  @ViewChild('dropdown') dropdown!: Dropdown;

  horariosData: Horario[] = [];
  horariosFilter: Horario[] = [];
  horariosCadast!: Horario;
  horariosEdit!: Horario;

  unsubscribe$!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  editar: boolean = false;
  cadastrar: boolean = false;
  
  visible: boolean = false;
  
  opcaoSemana: Semana[] = [];
  selectedSemana!: Semana;

  filterOptions: FiltrarPesquisa[] = [];
  selectedFilter!: FiltrarPesquisa;
  txtFilter: string = 'Pesquisar horário';

  messages!: Message[];

  constructor(
    private horarService: HorarioService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        diaSemana: [null, [Validators.required]],
        horaInicio: [null, [Validators.required]],
        horaFim: [null, [Validators.required]],
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
      {nome: 'Dia da semana', id: 0},
      {nome: 'Hora de início', id: 1},
    ];

    this.unsubscribe$ = this.horarService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.horariosData = data.sort((a: Horario, b: Horario) => {
          const timeA = a.horaInicio.toString();
          const timeB = b.horaInicio.toString();
          return timeA.localeCompare(timeB);
        });
        
        this.horariosFilter = this.horariosData;
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
    this.form.patchValue({
      id: value.id,
      diaSemana: value.diaSemana,
      horaInicio: value.horaInicio,
      horaFim: value.horaFim,
    })
    this.formatSemanaStr(value.diaSemana);
    if(this.selectedSemana) this.dropdown.writeValue(this.selectedSemana);
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Horário';
    this.visible = true;
    this.cadastrar = true;
    this.editar = false;
    this.selectedSemana = { nome: '', code: 0 };
    this.dropdown.writeValue(null);
  }
  
  hideDialog() {
    this.visible = false;
    this.form.reset();
    this.selectedSemana = { nome: '', code: 0 };
    this.dropdown.writeValue(null);
  }

  limparFilter(){
    const inputElement = this.inputSearch.nativeElement.value
    if (inputElement) {
      this.inputSearch.nativeElement.value = '';
    }
    this.selectedFilter = {} as FiltrarPesquisa;
    this.horariosData = this.horariosFilter;
  }

  updateMask() {
    if (this.selectedFilter?.id == 1) {
      this.txtFilter = '00:00';
    } else {
      this.txtFilter = 'Pesquisar horário';
    }
  }

  searchFilter0(term: string) {
    this.horariosData = this.horariosFilter.filter(hora => {
      if (hora.diaSemana.toLowerCase().includes(term.toLowerCase())) {
        return hora;
      } else {
        return null;
      }
    })
  }

  searchFilter1(term: string) {
    const compA = this.formatarTmStrTm(term);
    if(compA != null) {
      this.horariosData = this.horariosFilter.filter(hora => {
        const compB = this.formatarTmStrTm(hora.horaInicio);
        if(compB != null) {
          if (compA == compB) {
            return hora;
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

  formatarHora(tempo: any) {
    if (typeof tempo === 'string') {
      const partes = tempo.split(':');
      const horas = partes[0];
      const minutos = partes[1];

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

  formatSemanaStr(semana: DiaSemana) {
    if(semana.toString() == "DOMINGO") {
      this.selectedSemana = this.opcaoSemana[0];
    } else if(semana.toString() == "SEGUNDA") {
      this.selectedSemana = this.opcaoSemana[1];
    } else if(semana.toString() == "TERCA") {
      this.selectedSemana = this.opcaoSemana[2];
    } else if(semana.toString() == "QUARTA") {
      this.selectedSemana = this.opcaoSemana[3];
    } else if(semana.toString() == "QUINTA") {
      this.selectedSemana = this.opcaoSemana[4];
    } else if(semana.toString() == "SEXTA") {
      this.selectedSemana = this.opcaoSemana[5];
    } else if(semana.toString() == "SABADO") {
      this.selectedSemana = this.opcaoSemana[6];
    }

    return this.selectedSemana;
  }

  formatSemanaStrTable(semana: DiaSemana) {
    if(semana.toString() == "DOMINGO") {
      return this.opcaoSemana[0].nome;
    } else if(semana.toString() == "SEGUNDA") {
      return this.opcaoSemana[1].nome;
    } else if(semana.toString() == "TERCA") {
      return this.opcaoSemana[2].nome;
    } else if(semana.toString() == "QUARTA") {
      return this.opcaoSemana[3].nome;
    } else if(semana.toString() == "QUINTA") {
      return this.opcaoSemana[4].nome;
    } else if(semana.toString() == "SEXTA") {
      return this.opcaoSemana[5].nome;
    } else if(semana.toString() == "SABADO") {
      return this.opcaoSemana[6].nome;
    }
    return null
  }

  onKeyDown(event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      if (searchTerm != null || searchTerm != '') {
        if(this.selectedFilter) {
          if(this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
          if(this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
        }
      }
    }
  }
  
  filterField(searchTerm: string) {
    if (searchTerm != null || searchTerm != '') {
      if(this.selectedFilter) {
        if(this.selectedFilter.id == 0) this.searchFilter0(searchTerm);
        if(this.selectedFilter.id == 1) this.searchFilter1(searchTerm);
      }
    }
  }

  onDropdownChange() {
    const codeSemana = this.selectedSemana.code;
    if(codeSemana == 0) {
      this.form.patchValue({
        diaSemana: 'DOMINGO'
      })
    } else if(codeSemana == 1) {
      this.form.patchValue({
        diaSemana: 'SEGUNDA'
      })
    } else if(codeSemana == 2) {
      this.form.patchValue({
        diaSemana: 'TERCA'
      })
    } else if(codeSemana == 3) {
      this.form.patchValue({
        diaSemana: 'QUARTA'
      })
    } else if(codeSemana == 4) {
      this.form.patchValue({
        diaSemana: 'QUINTA'
      })
    } else if(codeSemana == 5) {
      this.form.patchValue({
        diaSemana: 'SEXTA'
      })
    } else if(codeSemana == 6) {
      this.form.patchValue({
        diaSemana: 'SABADO'
      })
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
    this.horarService.criar(this.horariosCadast).subscribe({
      next: (data: any) => {
        this.horariosCadast = data;
        console.log('envoi')
        this.goToRouteSave();
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Horário cadastrado com sucesso!', life: 3000 },
        ];
      },
      error: (err: any) => {
        console.log('deu erro')
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Cadastro não enviado.', life: 3000 },
        ];
      }
    });
  }

  enviarFormEdit(id: number) {
    this.horarService.atualizar(id, this.horariosEdit).subscribe({
      next: (data: any) => {
        this.horariosEdit = data;
        this.goToRouteEdit(id);
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Horário editado com sucesso!', life: 3000 },
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
    this.router.navigate(['api/horarios']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/horarios', id]);
  }

  onSubmit() {
    console.log(this.form.value)
    if (this.form.valid && this.cadastrar) {
      this.horariosCadast = this.form.value;
      this.enviarFormSave();
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
    this.horarService.excluir(id)
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
