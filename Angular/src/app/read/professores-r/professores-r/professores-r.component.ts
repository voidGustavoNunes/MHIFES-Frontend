import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Professor } from '../../../models/professor.models';
import { ProfessorService } from '../../../service/professor.service';


import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
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
import { InputSwitch, InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'app-professores-r',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TableModule,
    DialogModule,
    PaginatorModule,
    ReactiveFormsModule,
    FormsModule,
    ToastModule,
    ScrollTopModule,
    ConfirmPopupModule,
    InputSwitchModule
  ],
  templateUrl: './professores-r.component.html',
  styleUrls: ['./professores-r.component.scss'],
  providers: [
    ProfessorService,
    ConfirmationService,
    MessageService
  ]
})

export class ProfessoresRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  @ViewChild('switch') switch!: InputSwitch;

  professoresData: Professor[] = [];
  professoresFilter: Professor[] = [];
  professoresCadast: Professor[] = [];
  professoresEdit: Professor[] = [];

  unsubscribe$!: Subscription;
  form: FormGroup;
  selectedDrop: boolean = false;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;

  constructor(
    private professorService: ProfessorService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private ngZone: NgZone
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        matricula: [null, [Validators.required]],
        curso: [null, [Validators.required]],
        ehCoordenador: [new FormControl<boolean>(false), Validators.required]
      });
  }

  ngOnInit() {
    this.unsubscribe$ = this.professorService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.professoresData = data.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
        this.professoresFilter = this.professoresData;
      },
      error: (err: any) => {
        alert('Dados não encontrados.')
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
  }

  showEditDialog(value: Professor) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Professor'
    this.visible = true;
    this.cadastrar = false;
    this.editar = true;
    this.form.setValue({
      id: value.id,
      nome: value.nome,
      matricula: value.matricula,
      curso: value.curso,
      ehCoordenador: value.ehCoordenador
    });
    this.switch.writeValue(value.ehCoordenador);
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Professor';
    this.visible = true;
    this.cadastrar = true;
    this.editar = false;
    this.switch.writeValue(null);
  }
  
  hideDialog() {
    this.visible = false;
    this.form.reset();
    this.switch.writeValue(null);
  }
  
  limparFilter(){
    const inputElement = this.inputSearch.nativeElement.value
    if (inputElement) {
      this.inputSearch.nativeElement.value = '';
    }
    this.professoresData = this.professoresFilter;
  }

  searchFilterWord(term: string) {
    this.professoresData = this.professoresFilter.filter(el => {
      if (el.nome.toLowerCase().includes(term.toLowerCase())) {
        return el;
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
    this.professorService.criar(this.professoresCadast).subscribe({
      next: (data: any) => {
        this.professoresCadast = data;
        this.goToRouteSave();
        alert('Professor cadastrado com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Cadastro não enviado.')
      }
    });
  }

  enviarFormEdit(id: number) {
    this.professorService.atualizar(id, this.professoresEdit).subscribe({
      next: (data: any) => {
        this.professoresEdit = data;
        this.goToRouteEdit(id);
        alert('Professor editado com sucesso!');
      },
      error: (err: any) => {
        alert('Erro! Edição não enviada.')
      }
    });
  }

  goToRouteSave() {
    this.router.navigate(['api/professores']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/professores', id]);
  }

  onDropdownChange(event: any) {
    this.selectedDrop = event.value;
    alert('Valor selecionado:'+ this.selectedDrop);
  }

  onSubmit() {
    console.log(this.form.get('ehCoordenador')?.value)
    if (this.form.valid && this.cadastrar) {
      this.professoresCadast = this.form.value;
      this.enviarFormSave();
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.professoresEdit = this.form.value;
      this.enviarFormEdit(this.form.get('id')?.value);
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      window.location.reload();
    } else {
      alert('Informação inválida. Preencha os campos corretamente!');
    }
  }

  deletarID(id: number) {
    this.professorService.excluir(id)
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
