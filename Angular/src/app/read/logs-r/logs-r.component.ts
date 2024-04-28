import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localePT from '@angular/common/locales/pt';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { Log, Operacao } from '../../models/log.models';
import { UserRole } from '../../models/usuario';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';

registerLocaleData(localePT);

@Component({
  selector: 'app-logs-r',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    PrimeNgImportsModule
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

  limparFilter() {
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
      case 'ALTERACAO':
        return 'update-log';
      case 'INCLUSAO':
        return 'incluse-log';
      case 'EXCLUSAO':
        return 'delete-log';
      default:
        return 'default-log';
    }
  }

  getSeverity(operacao: Operacao) {
    switch (operacao.toString()) {
      case 'ALTERACAO':
        return 'warning';
      case 'INCLUSAO':
        return 'success';
      case 'EXCLUSAO':
        return 'danger';
      default:
        return null;
    }
  }

  getIcons(operacao: Operacao) {
    switch (operacao.toString()) {
      case 'ALTERACAO':
        return 'pi pi-pencil';
      case 'INCLUSAO':
        return 'pi pi-save';
      case 'EXCLUSAO':
        return 'pi pi-trash';
      default:
        return null;
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
