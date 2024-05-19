import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { CoordenadoriaService } from '../../service/coordenadoria.service';
import { Coordenadoria } from '../../models/coordenadoria.models';
import { ProfessorService } from '../../service/professor.service';
import { Professor } from '../../models/professor.models';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { Dropdown } from 'primeng/dropdown';

@Component({
  selector: 'app-coordenadorias-r',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PrimeNgImportsModule
  ],
  templateUrl: './coordenadorias-r.component.html',
  styleUrl: './coordenadorias-r.component.scss',
  providers: [
    CoordenadoriaService,
    ConfirmationService,
    MessageService,
    ProfessorService
  ]
})
export class CoordenadoriasRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;
  @ViewChild('dropdown') dropdown!: Dropdown;

  coordenadoriasData: Coordenadoria[] = [];
  coordenadoriasFilter: Coordenadoria[] = [];
  coordenadoriasCadast!: Coordenadoria;
  coordenadoriasEdit!: Coordenadoria;

  unsubscribe$!: Subscription;
  unsubscribe$Prof!: Subscription;
  form: FormGroup;

  ehTitulo: string = '';
  visible: boolean = false;
  editar: boolean = false;
  cadastrar: boolean = false;
  
  messages!: Message[];
  mss: boolean = false;

  coordenadoresArray: Professor[] = [];

  constructor(
    private coordaService: CoordenadoriaService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private professorService: ProfessorService
    ) {
      this.form = this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        coordenador: [null, [Validators.required]]
      });
  }

  ngOnInit() {
    this.unsubscribe$ = this.coordaService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.coordenadoriasData = data.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);
        this.coordenadoriasFilter = this.coordenadoriasData;
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de coordenadorias não encontrados.', life: 3000 },
        ];
      }
    });

    this.unsubscribe$Prof = this.professorService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens.sort((a:any, b:any) => (a.nome < b.nome) ? -1 : 1);

        data.forEach((prf: Professor) => {
          if(prf.ehCoordenador) {
            this.coordenadoresArray.push(prf);
          }
        })
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de professores não encontrados.', life: 3000 },
        ];
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.unsubscribe();
    this.unsubscribe$Prof.unsubscribe();
  }

  showEditDialog(value: Coordenadoria) {
    this.form.reset();
    this.ehTitulo = 'Atualizar Coordenadoria'
    this.visible = true;
    this.cadastrar = false;
    this.editar = true;
    this.form.patchValue({
      id: value.id,
      nome: value.nome,
      coordenador: value.coordenador
    })
    console.log(value.coordenador)
    // this.dropdown.writeValue(value.coordenador)
  }

  showDialog() {
    this.form.reset();
    this.ehTitulo = 'Cadastrar Coordenadoria';
    this.visible = true;
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
    this.coordenadoriasData = this.coordenadoriasFilter;
  }

  searchFilterWord(term: string) {
    this.coordenadoriasData = this.coordenadoriasFilter.filter(el => {
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
    if (searchTerm && (searchTerm != null || searchTerm != '')) {
      this.searchFilterWord(searchTerm);
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
    this.coordaService.criar(this.coordenadoriasCadast).subscribe({
      next: (data: any) => {
        this.coordenadoriasCadast = data;
        // this.goToRouteSave();
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Coordenadoria cadastrada com sucesso!', life: 3000 },
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
    this.coordaService.atualizar(id, this.coordenadoriasEdit).subscribe({
      next: (data: any) => {
        this.coordenadoriasEdit = data;
        // this.goToRouteEdit(id);
        this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Coordenadoria editada com sucesso!', life: 3000 },
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
    this.router.navigate(['api/coordenadorias']);
  }

  goToRouteEdit(id: number) {
    this.router.navigate(['api/coordenadorias', id]);
  }

  onSubmit() {
    console.log(this.form.value)
    if (this.form.valid && this.cadastrar) {
      this.coordenadoriasCadast = this.form.value;
      this.enviarFormSave();
      this.visible = false;
      this.form.reset();
      this.ngOnInit();
      // window.location.reload();
    } else if (this.form.valid && this.editar) {
      this.coordenadoriasEdit = this.form.value;
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
    this.coordaService.excluir(id)
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
