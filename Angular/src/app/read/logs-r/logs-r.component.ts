import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Disciplina } from '../../models/disciplina.models';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, registerLocaleData } from '@angular/common';
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
import { MessagesModule } from 'primeng/messages';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { Log, Operacao } from '../../models/log.models';
import { UserRole } from '../../models/usuario';
import localePT from '@angular/common/locales/pt';
registerLocaleData(localePT);

@Component({
  selector: 'app-logs-r',
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
    MessagesModule,
    AccordionModule,
    DividerModule
  ],
  templateUrl: './logs-r.component.html',
  styleUrl: './logs-r.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
  ]
})
export class LogsRComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputSearch!: ElementRef;

  logsData: Log[] = [];
  logsFilter: Log[] = [];
  
  unsubscribe$!: Subscription;
  
  messages!: Message[];
  visible: boolean = false;

  logsExample!: Log;

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService
    ) {
  }

  ngOnInit() {

    this.logsExample = {
        id: 1,
        data: new Date(),
        hora: {
          "hours": 10,
          "minutes": 20,
      },
        descricao: "Mussum Ipsum, cacilds vidis litro abertis.  Manduma pindureta quium dia nois paga. Mauris nec dolor in eros commodo tempor. Aenean aliquam molestie leo, vitae iaculis nisl. Vehicula non. Ut sed ex eros. Vivamus sit amet nibh non tellus tristique interdum. Aenean aliquam molestie leo, vitae iaculis nisl.\nQuem manda na minha terra sou euzis! Suco de cevadiss deixa as pessoas mais interessantis. Negão é teu passadis, eu sou faxa pretis. Si num tem leite então bota uma pinga aí cumpadi!\nDetraxit consequat et quo num tendi nada. Interessantiss quisso pudia ce receita de bolis, mais bolis eu num gostis. Paisis, filhis, espiritis santis. Eu nunca mais boto a boca num copo de cachaça, agora eu só uso canudis!",
        operacao: Operacao.ALTERACAO,
        idRegistro: 1,
        usuario: {
          id: 1,
          login: "admin@2024",
          nome: "Admin",
          password: "123456",
          role: UserRole.ADMIN
        }
    }
  }

  ngOnDestroy() {
    // this.unsubscribe$.unsubscribe();
  }

  showDialog() {
    this.visible = true;
  }
  
  hideDialog() {
    this.visible = false;
  }
  
  limparFilter(){
    const inputElement = this.inputSearch.nativeElement.value
    if (inputElement) {
      this.inputSearch.nativeElement.value = '';
    }
    this.logsData = this.logsFilter;
  }

  searchFilterWord(term: string) {
    this.logsData = this.logsFilter.filter(el => {
      if (el.descricao.toLowerCase().includes(term.toLowerCase())) {
        return el;
      } else {
        return null;
      }
    })
  }

  onKeyDown(event: KeyboardEvent, searchTerm: string) {
    if (event.key === "Enter") {
      if (searchTerm != null || searchTerm != '') {
        // this.searchFilterWord(searchTerm);
      }
    }
  }

  filterField(searchTerm: string) {
    if (searchTerm != null || searchTerm != '') {
      // this.searchFilterWord(searchTerm);
    }
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
  getLogClass(operacao: Operacao): string {
    switch (operacao.toString()) {
      case 'ALTERAÇÃO':
        return 'update-log';
      case 'INCLUSÃO':
        return 'incluse-log';
      case 'EXCLUSÃO':
        return 'delete-log';
      default:
        return 'default-log';
    }
  }

  // confirm2(event: Event, id: number) {
  //   this.confirmationService.confirm({
  //     target: event.target as EventTarget,
  //     message: 'Deseja excluir esse registro?',
  //     icon: 'pi pi-info-circle',
  //     acceptButtonStyleClass: 'p-button-danger p-button-sm',
  //     accept: () => {
  //       this.deletarID(id);
  //     },
  //     reject: () => {
  //       this.messages = [
  //         { severity: 'info', summary: 'Cancelado', detail: 'Exclusão cancelada.', life: 3000 },
  //       ];
  //     }
  //   });
  // }

  // deletarID(id: number) {
  //   this.disciService.excluir(id)
  //   .subscribe({
  //     next: (data: any) => {
  //       this.messages = [
  //         { severity: 'success', summary: 'Sucesso', detail: 'Registro deletado com sucesso!', life: 3000 },
  //       ];
  //       this.ngOnInit();
  //     },
  //     error: (err: any) => {
  //       if (err.status) {
  //         this.messages = [
  //           { severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar registro.', life: 3000 },
  //         ];
  //       } else {
  //         this.messages = [
  //           { severity: 'error', summary: 'Erro desconhecido', detail: err, life: 3000 },
  //         ];
  //       }
  //     }
  //   });
  // }

}
