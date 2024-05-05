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
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ScrollTopModule } from 'primeng/scrolltop';
import { InputSwitch, InputSwitchModule } from 'primeng/inputswitch';
import { MessagesModule } from 'primeng/messages';
import { FiltrarPesquisa } from '../../../models/share/filtrar-pesquisa.models';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { Coordenadoria } from '../../../models/coordenadoria.models';
import { CoordenadoriaService } from '../../../service/coordenadoria.service';

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
    InputSwitchModule,
    MessagesModule,
    OverlayPanelModule,
    DropdownModule
  ],
  templateUrl: './professores-r.component.html',
  styleUrls: ['./professores-r.component.scss'],
  providers: [
    ProfessorService,
    ConfirmationService,
    MessageService,
    CoordenadoriaService
  ]
})

export class ProfessoresRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInputOri') inputSearchOri!: ElementRef;
  @ViewChild('searchInputProf') inputSearchProf!: ElementRef;
  @ViewChild('searchTable2') searchTable2!: ElementRef;
  @ViewChild('searchTable1') searchTable1!: ElementRef;
  @ViewChild('switch') switch!: InputSwitch;
  @ViewChild('dropdown') dropdown!: Dropdown;

  professoresCadast: Professor[] = [];
  professoresEdit!: Professor;
  
  professoresFilterOri: Professor[] = [];
  professoresNaoOrienta: Professor[] = [];
  
  professoresFilterProf: Professor[] = [];
  professoresOrientador: Professor[] = [];

  unsubscribe$!: Subscription;
  unsubscribe$Coord!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;
  switchCooda: boolean = false;
  
  messages!: Message[];
  mss: boolean = false;
  
  filterOptions: FiltrarPesquisa[] = [];
  selectedFilterOri!: FiltrarPesquisa;
  selectedFilterProf!: FiltrarPesquisa;
  
  professorInfo!: Professor;
  visibleInfo: boolean = false;

  coordenadoriasArray: Coordenadoria[] = [];

  constructor(
    private professorService: ProfessorService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private coordaService: CoordenadoriaService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        matricula: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        sigla: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        ehCoordenador: [false, [Validators.required]],
        coordenadoria: [null],
      });
  }

  ngOnInit() {
    this.filterOptions = [
      {nome: 'Nome', id: 0},
      {nome: 'Sigla', id: 1},
      {nome: 'Matrícula', id: 2}
    ];

    this.unsubscribe$ = this.professorService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
        this.professoresNaoOrienta = [];
        this.professoresOrientador = [];

        data.forEach((prf: Professor) => {
          if(!prf.ehCoordenador) {
            this.professoresNaoOrienta.push(prf);
            this.professoresFilterProf.push(prf);
          }
        })
        data.forEach((prf: Professor) => {
          if(prf.ehCoordenador) {
            this.professoresOrientador.push(prf);
            this.professoresFilterOri.push(prf);
          }
        })
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de professores não encontrados.', life: 3000 },
        ];
      }
    });
    
    this.unsubscribe$Coord = this.coordaService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.coordenadoriasArray = data.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de coordenadorias não encontrados.', life: 3000 },
        ];
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
    this.unsubscribe$Coord.unsubscribe();
  }

  showInfoDialog(value: Professor) {
    this.visibleInfo = true;
    this.professorInfo = value;
  }

  showEditDialog(value: Professor) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Professor'
    this.visible = true;
    this.visibleInfo = false;
    this.cadastrar = false;
    this.editar = true;
    this.form.setValue({
      id: value.id,
      nome: value.nome,
      matricula: value.matricula,
      sigla: value.sigla,
      ehCoordenador: value.ehCoordenador,
      coordenadoria: value.coordenadoria,
    });
    this.switch.writeValue(value.ehCoordenador);
    if(!value.ehCoordenador) {
      this.dropdown.writeValue(value.coordenadoria)
    }
  }

  showDialog() {
    this.form.reset();
    this.form.patchValue({
      ehCoordenador: false
    });
    this.ehTitulo = 'Cadastrar Professor';
    this.visible = true;
    this.visibleInfo = false;
    this.cadastrar = true;
    this.editar = false;
    this.switch.writeValue(false);
    this.switchCooda = false;
  }
  
  hideDialog() {
    this.visible = false;
    this.form.reset();
    this.switch.writeValue(false);
    this.switchCooda = false;
  }

  patchForm() {
    if(this.switchCooda) {
      this.form.patchValue({
        coordenadoria: null
      })
    }
  }

  limparFilter(tipo: string){
    if(tipo == 'o') {
      const inputElement = this.inputSearchOri.nativeElement.value
      if (inputElement) {
        this.inputSearchOri.nativeElement.value = '';
      }
      this.selectedFilterOri = {} as FiltrarPesquisa;
      this.professoresOrientador = this.professoresFilterOri;
    } else if(tipo == 'p') {
      const inputElement = this.inputSearchProf.nativeElement.value
      if (inputElement) {
        this.inputSearchProf.nativeElement.value = '';
      }
      this.selectedFilterProf = {} as FiltrarPesquisa;
      this.professoresNaoOrienta = this.professoresFilterProf;
    }
  }

  searchFilter0(tipo: string, term: string) {
    if(tipo == 'o') {
      this.professoresOrientador = this.professoresFilterOri.filter(el => {
        if (el.nome.toLowerCase().includes(term.toLowerCase())) {
          return el;
        } else {
          return null;
        }
      })
    } else if(tipo == 'p') {
      this.professoresNaoOrienta = this.professoresFilterProf.filter(el => {
        if (el.nome.toLowerCase().includes(term.toLowerCase())) {
          return el;
        } else {
          return null;
        }
      })
    }
  }

  searchFilter1(tipo: string, term: string) {
    if(tipo == 'o') {
      this.professoresOrientador = this.professoresFilterOri.filter(el => {
        if (el.sigla.toLowerCase().includes(term.toLowerCase())) {
          return el;
        } else {
          return null;
        }
      })
    } else if(tipo == 'p') {
      this.professoresNaoOrienta = this.professoresFilterProf.filter(el => {
        if (el.sigla.toLowerCase().includes(term.toLowerCase())) {
          return el;
        } else {
          return null;
        }
      })
    }
  }

  searchFilter2(tipo: string, term: string) {
    if(tipo == 'o') {
      this.professoresOrientador = this.professoresFilterOri.filter(el => {
        if (el.matricula.toString().toLowerCase().includes(term.toLowerCase())) {
          return el;
        } else {
          return null;
        }
      })
    } else if(tipo == 'p') {
      this.professoresNaoOrienta = this.professoresFilterProf.filter(el => {
        if (el.matricula.toString().toLowerCase().includes(term.toLowerCase())) {
          return el;
        } else {
          return null;
        }
      })
    }
  }

  onKeyDown(tipo: string, event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      this.filterField(tipo, searchTerm);
    }
  }
  
  filterField(tipo: string, searchTerm: string) {
    if (searchTerm != null || searchTerm != '') {
        if(this.selectedFilterOri) {
          if(this.selectedFilterOri.id == 0) this.searchFilter0(tipo, searchTerm);
          if(this.selectedFilterOri.id == 1) this.searchFilter1(tipo, searchTerm);
          if(this.selectedFilterProf.id == 2) this.searchFilter2(tipo, searchTerm);
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
          { severity: 'info', summary: 'Cancelado', detail: 'Exclusão cancelada.', life: 3000 },
        ];
      }
    });
  }

  enviarFormSave() {
    this.professorService.criar(this.professoresCadast).subscribe({
      next: (data: any) => {
        // this.goToRouteSave();
        if (data.status === 'success') {
          this.professoresCadast = data;
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Professor cadastrado com sucesso!', life: 3000 },
          ];
          this.ngOnInit();
        } else {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Matrícula já existente!', life: 3000 },
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
    this.professorService.atualizar(id, this.professoresEdit).subscribe({
      next: (data: any) => {
        this.professoresEdit = data;
        // this.goToRouteEdit(id);
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Professor editado com sucesso!', life: 3000 },
        ];
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Edição não enviada.', life: 3000 },
        ];
      }
    });
  }

  onSubmit() {
    if (this.form.valid && this.cadastrar) {
      this.professoresCadast = this.form.value;
      this.enviarFormSave();
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      // window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.professoresEdit = this.form.value;
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
    this.professorService.excluir(id)
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
