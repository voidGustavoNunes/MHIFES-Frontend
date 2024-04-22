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
import { Coordenadoria } from '../../../models/coordenadoria.models';
import { CoordenadoriaService } from '../../../service/coordenadoria.service';
import { Dropdown, DropdownModule } from 'primeng/dropdown';

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

  coordenadoriasArray: Coordenadoria[] = [];

  unsubscribe$!: Subscription;
  unsubscribe$Cooda!: Subscription;
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

  constructor(
    private professorService: ProfessorService,
    private coordaService: CoordenadoriaService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        matricula: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        curso: [null],
        ehCoordenador: [false, [Validators.required]],
        coordenadoria: [null]
      }, { validator: this.peloMenosUmSelecionadoValidator });
  }

  ngOnInit() {
    this.filterOptions = [
      {nome: 'Nome', id: 0},
      {nome: 'Matrícula', id: 1},
      {nome: 'Curso', id: 2},
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

    this.unsubscribe$Cooda = this.coordaService.listar()
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
    this.unsubscribe$Cooda.unsubscribe();
  }

  peloMenosUmSelecionadoValidator(formGroup: FormGroup) {
    const curso = formGroup.get('curso')?.value;
    const coordenadoria = formGroup.get('coordenadoria')?.value;

    if (!curso && !coordenadoria) {
      return { peloMenosUmSelecionado: true };
    }

    return null;
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
      curso: value.curso,
      ehCoordenador: value.ehCoordenador,
      coordenadoria: value.coordenadoria
    });
    this.switch.writeValue(value.ehCoordenador);
    if(value.ehCoordenador) {
      this.switchCooda = true;
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
    if(this.editar && !this.switchCooda) {
      this.form.patchValue({
        coordenadoria: null
      })
    } else if(this.editar && this.switchCooda) {
      this.form.patchValue({
        curso: null
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

  searchFilter1(tipo: string, term: string) {
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

  searchFilter2(tipo: string, term: string) {
    if(tipo == 'o') {
      this.professoresOrientador = this.professoresFilterOri.filter(el => {
        if (el.curso?.toLowerCase().includes(term.toLowerCase())) {
          return el;
        } else {
          return null;
        }
      })
    } else if(tipo == 'p') {
      this.professoresNaoOrienta = this.professoresFilterProf.filter(el => {
        if (el.curso?.toLowerCase().includes(term.toLowerCase())) {
          return el;
        } else {
          return null;
        }
      })
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

  onKeyDown(tipo: string, event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      if (searchTerm != null || searchTerm != '') {
        if(tipo == 'o') {
          if(this.selectedFilterOri) {
            if(this.selectedFilterOri.id == 0) this.searchFilter0(tipo, searchTerm);
            if(this.selectedFilterOri.id == 1) this.searchFilter1(tipo, searchTerm);
            if(this.selectedFilterOri.id == 2) this.searchFilter2(tipo, searchTerm);
          }
        } else if(tipo == 'p') {
          if(this.selectedFilterProf) {
            if(this.selectedFilterProf.id == 0) this.searchFilter0(tipo, searchTerm);
            if(this.selectedFilterProf.id == 1) this.searchFilter1(tipo, searchTerm);
            if(this.selectedFilterProf.id == 2) this.searchFilter2(tipo, searchTerm);
          }
        }
      }
    }
  }
  
  filterField(tipo: string, searchTerm: string) {
    if (searchTerm != null || searchTerm != '') {
      if(tipo == 'o') {
        if(this.selectedFilterOri) {
          if(this.selectedFilterOri.id == 0) this.searchFilter0(tipo, searchTerm);
          if(this.selectedFilterOri.id == 1) this.searchFilter1(tipo, searchTerm);
          if(this.selectedFilterOri.id == 2) this.searchFilter2(tipo, searchTerm);
        }
      } else if(tipo == 'p') {
        if(this.selectedFilterProf) {
          if(this.selectedFilterProf.id == 0) this.searchFilter0(tipo, searchTerm);
          if(this.selectedFilterProf.id == 1) this.searchFilter1(tipo, searchTerm);
          if(this.selectedFilterProf.id == 2) this.searchFilter2(tipo, searchTerm);
        }
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
        this.professoresCadast = data;
        this.goToRouteSave();
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Professor cadastrado com sucesso!', life: 3000 },
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
    this.professorService.atualizar(id, this.professoresEdit).subscribe({
      next: (data: any) => {
        this.professoresEdit = data;
        this.goToRouteEdit(id);
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

  goToRouteSave() {
    this.router.navigate(['api/professores']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/professores', id]);
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
