import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Message, MessageService } from 'primeng/api';
import { PrimeNgImportsModule } from '../../shared/prime-ng-imports/prime-ng-imports.module';
import { UserAuthService } from '../../_services/user-auth.service';
import { AlocacaoService } from '../../service/alocacao.service';
import { Subscription } from 'rxjs';
import { Alocacao } from '../../models/alocacao.models';
import { Aluno } from '../../models/aluno.models';

@Component({
  selector: 'app-scanner-popup',
  standalone: true,
  imports: [
    PrimeNgImportsModule,
  ],
  templateUrl: './scanner-popup.component.html',
  styleUrl: './scanner-popup.component.scss',
  providers: [
    MessageService,
    UserAuthService,
    AlocacaoService
  ]
})
export class ScannerPopupComponent implements OnInit, OnDestroy, AfterViewInit {
  // @ViewChild('scannerInput') scannerInput!: InputText;
  @ViewChild('scannerInput') scannerInput!: ElementRef;
  
  messages!: Message[];
  barcode: string = '';
  previousBarcode: string = '';
  
  unsubscribe$!: Subscription;
  alocacoesArray: Alocacao[] = [];
  
  alunoComHorario!: Aluno;
  
  visible: boolean = false;
  mssVazio: string = '';

  constructor(
    private router: Router,
    private userAuthService: UserAuthService,
    private alocService: AlocacaoService
  ) {
  }

  ngOnInit(): void {
    this.scannerInput.nativeElement.focus();
  }

  ngOnDestroy() {
  }

  ngAfterViewInit(): void {
    const scannerInput = document.getElementById('scannerInput');
    const otherInputs = document.querySelectorAll('input:not(#scannerInput)');
    const otherInputsArray = Array.from(otherInputs);

    document.addEventListener('click', (event:any) => {
      const isPrimeNGInput = event.target.classList.contains('p-inputtext') || event.target.classList.contains('p-inputnumber');
      // console.log('is ',isPrimeNGInput)

      if ( (scannerInput?.contains(event.target) || !scannerInput?.contains(event.target)) && !otherInputsArray.some((input:any) => input.contains(event.target)) && !isPrimeNGInput ) {
        // console.log('voltou fc')
        // this.scannerInput.nativeElement.addEventListener('blur', () => {
          this.scannerInput.nativeElement.focus();
        // });
      } else if( (scannerInput?.contains(event.target) || !scannerInput?.contains(event.target)) && (otherInputsArray.some((input:any) => input.contains(event.target)) || isPrimeNGInput) ) {
        // console.log('saiu fc')
        this.scannerInput.nativeElement.blur();
      }
    });
  }

  formatarDtStrDt(date: any) {
    if(date) {
      const partes = date.split('-');
      const ano = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const dia = parseInt(partes[2], 10);

      return new Date(ano, mes, dia);
    } else {
      return new Date();
    }
  }
  
  isLogged() {
    return this.userAuthService.isLoggedIn();
  }
  
  onKey() {
    const url = this.router.url;
    const role = this.userAuthService.getRole();
    const login = this.userAuthService.getLogin();

    if ((this.isLogged() && !url.includes('login') && !url.includes('forbidden')) || (this.isLogged() && url.includes('relatorios'))) {
      if(role == "ADMIN" || login == this.previousBarcode) {
        setTimeout(() => {
          this.previousBarcode = this.barcode;
          this.barcode = ''
          this.carregarUsers()
        }, 500);
      } else if(login != this.previousBarcode) {
        this.visible = true
        this.mssVazio = 'Faça o login com a sua conta'
      }
    } else {
      this.barcode = '';
    }
  }

  mostrarHorarioUser() {
    for (const aloc of this.alocacoesArray) {
      for (const aln of aloc.periodoDisciplina.alunos) {
        console.log('aln ',aln.matricula, 'prev ', this.previousBarcode)
        if(aln.matricula == this.previousBarcode) this.alunoComHorario = aln;
      }
    }

    if(this.alunoComHorario != null && this.alunoComHorario != undefined) {
      this.mssVazio = ''
      this.visible = true
    } else {
      this.visible = true
      this.mssVazio = 'não há horário para esta matrícula'
    }
  }

  carregarUsers() {
    this.alocService.listar()
    .subscribe({
      next: (itens:any) => {
        const data = itens;
        this.alocacoesArray = data;

        this.alocacoesArray = this.alocacoesArray.filter((alocacao) => {
          const hoje = new Date();
          const periodo = alocacao.periodoDisciplina.periodo;
          if(periodo) {
            if(hoje.getTime() >= this.formatarDtStrDt(periodo.dataInicio).getTime() && hoje.getTime() <= this.formatarDtStrDt(periodo.dataFim).getTime()) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        })

        this.alocacoesArray = this.alocacoesArray.filter(alocacao => alocacao.status == 'ATIVO');

        this.mostrarHorarioUser()
      },
      error: (err: any) => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Dados de alocações não encontrados.', life: 3000 },
        ];
      }
    });
  }
}
