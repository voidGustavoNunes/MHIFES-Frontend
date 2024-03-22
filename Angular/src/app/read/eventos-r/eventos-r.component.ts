import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
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
import { CalendarModule } from 'primeng/calendar';
import { Evento } from '../../models/evento.models';
import { EventoService } from '../../service/evento.service';
import { Local } from '../../models/local.models';
import { LocalService } from '../../service/local.service';
import { Dropdown, DropdownModule } from 'primeng/dropdown';

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
    DropdownModule
  ],
  templateUrl: './eventos-r.component.html',
  styleUrl: './eventos-r.component.scss',
  providers: [
    EventoService,
    LocalService,
    ConfirmationService,
    MessageService
  ]
})
export class EventosRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  @ViewChild('dropdown') dropdown!: Dropdown;

  eventosData: Evento[] = [];
  eventosFilter: Evento[] = [];
  eventosCadast: Evento[] = [];
  eventosEdit: Evento[] = [];

  locaisArray: Local[] = [];

  unsubscribe$!: Subscription;
  unsubscribe$LA!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;

  constructor(
    private eventService: EventoService,
    private locService: LocalService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        intervaloData: this.formBuilder.array([]),
        descricao: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        local: [null, Validators.required]
      });
  }

  ngOnInit() {
    this.unsubscribe$ = this.eventService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.eventosData = data;
        this.eventosFilter = this.eventosData;
      },
      error: (err: any) => {
        alert('Dados de eventos não encontrados.')
      }
    });

    this.unsubscribe$LA = this.locService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.locaisArray = data.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
      },
      error: (err: any) => {
        alert('Dados de locais não encontrados.')
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
    this.unsubscribe$LA.unsubscribe();
  }

  showEditDialog(value: Evento) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Evento'
    this.visible = true;
    this.cadastrar = false;
    this.editar = true;
    this.form.setValue({
      id: value.id,
      intervaloData: value.intervaloData,
      descricao: value.descricao,
      local: value.local
    })
    this.dropdown.writeValue(value.local.nome);
    // this.form.controls['dataFim'].setValue(new Date(value.dataFim));
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Evento';
    this.visible = true;
    this.cadastrar = true;
    this.editar = false;
    this.dropdown.writeValue(null);
  }
  
  hideDialog() {
    this.visible = false;
    this.form.reset();
    this.dropdown.writeValue(null);
  }
  
  limparFilter(){
    const inputElement = this.inputSearch.nativeElement.value
    if (inputElement) {
      this.inputSearch.nativeElement.value = '';
    }
    this.eventosData = this.eventosFilter;
  }

  searchFilterWord(term: string) {
    this.eventosData = this.eventosFilter.filter(el => {
      const searchTermAsNumber = parseInt(term);
      if (!isNaN(searchTermAsNumber)) {
        const anos = el.intervaloData.map(data => new Date(data).getFullYear());
        if (anos.includes(searchTermAsNumber)) {
          return el;
        } else {
          return null;
        }
      } else {
        return null;
      }
    })
  }

  formatarDatas(intervalo: Date[]): string {
    const datasFormatadas = intervalo.map(dt => {
      const dia = dt.getDate();
      const mes = dt.toLocaleString('default', { month: 'short' });
      return `${dia}/${mes}`;
    }).join(', ');

    const ano = intervalo[0].getFullYear();

    return `${datasFormatadas} ${ano}`;
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
    this.eventService.criar(this.eventosCadast).subscribe({
      next: (data: any) => {
        this.eventosCadast = data;
        this.goToRouteSave();
        alert('Evento cadastrado com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Cadastro não enviado.')
      }
    });
  }

  enviarFormEdit(id: number) {
    this.eventService.atualizar(id, this.eventosEdit).subscribe({
      next: (data: any) => {
        this.eventosEdit = data;
        this.goToRouteEdit(id);
        alert('Evento editado com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Edição não enviada.')
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
      this.eventosCadast = this.form.value;
      this.enviarFormSave();
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.eventosEdit = this.form.value;
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
    this.eventService.excluir(id)
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


