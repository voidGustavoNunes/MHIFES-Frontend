import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { AuthService } from '../../_service/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { Pessoa } from '../../models/pessoa.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    PasswordModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
    MessagesModule,
    HttpClientModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
  ]
})
export class RegisterComponent implements OnInit {
  errU: boolean = false;
  errM: boolean = false;
  errS: boolean = false;
  
  mssU: string = '';
  mssM: string = '';
  mssS: string = '';
  
  messages!: Message[];

  form: FormGroup;
  user!: Pessoa;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authServ: AuthService,
    ) {
      this.form = this.formBuilder.group({
        nomeUser: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        matricula: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        senha: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(15)]]
      })
  }

  ngOnInit() {}

  onSubmit() {
    if(this.form.valid) {
      this.user = this.form.value;
      this.errU = false;
      this.errM = false;
      this.errS = false;
      this.sendLogData();
    } else {
      let nom = this.form.get('nomeUser')?.value;
      let mat = this.form.get('matricula')?.value;
      let sen = this.form.get('senha')?.value;
      if(!nom) {
        this.errU = true;
        this.mssU = 'Por favor insira um nome de usuário.';
      }
      if(!mat) {
        this.errM = true;
        this.mssM = 'Por favor insira a matrícula.';
      }
      if(!sen) {
        this.errS = true;
        this.mssS = 'Senha no mínimo de 6 caracteres.';
      }

      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha os campos!', life: 3000 },
      ];
    }
    // this.router.navigate(['login']);
  }

  sendLogData() {
    console.log('verificando login user')
    this.authServ.verificarRegisterLogData(this.user);

    console.log('sev ', this.authServ.severity)
    if(this.authServ.severity == 1) {
      this.form.reset();
      this.messages = [
        { severity: 'success', summary: 'Sucesso', detail: this.authServ.resposta, life: 5000 },
      ];
      setTimeout(() => {
        this.router.navigate(['login']).then(() => {
          window.location.reload();
        });
      }, 5000);
    } else if(this.authServ.severity == 2) {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: this.authServ.resposta, life: 3000 },
      ];
    } else if(this.authServ.severity == 3) {
      this.messages = [
        { severity: 'error', summary: 'Erro', detail: this.authServ.resposta, life: 3000 },
      ];
    }
  }
}
