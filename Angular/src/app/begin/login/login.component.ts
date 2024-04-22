import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessagesModule } from 'primeng/messages';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { AuthService } from '../../_service/auth.service';
import { LoginUser } from '../../models/pessoa.models';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    AuthService,
  ]
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  login!: LoginUser;

  errM: boolean = false;
  errS: boolean = false;
  
  mssM: string = '';
  mssS: string = '';
  
  messages!: Message[];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authServ: AuthService,
    ) {
      this.form = this.formBuilder.group({
        matricula: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        senha: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(15)]]
      });
  }

  ngOnInit() {}

  navigateToPage() {
    this.router.navigate(['/registrar']);
  }

  onSubmit() {
    if (this.form.valid) {
      this.login = this.form.value;
      
      this.authServ.fazerLogin(this.login)
      .then((resposta: number) => {
        if (resposta === 0) {
          this.messages = [
            { severity: 'success', summary: 'Sucesso', detail: 'Usuário autenticado com sucesso!\nAguarde...', life: 5000 },
          ];
          this.errM = false;
          this.errS = false;
          setTimeout(() => {
            this.router.navigate(['home']).then(() => {
              window.location.reload();
            });
          }, 5000);
        } else if (resposta === 1) {
          this.mssM = 'Matrícula incorreta.';
          this.errM = true;
          this.errS = false;
        } else if (resposta === 2) {
          this.mssS = 'Senha incorreta. Mínimo de 6 caracteres.';
          this.errS = true;
          this.errM = false;
        } else {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Usuário não encontrado.', life: 3000 },
          ];
        }
      })
      .catch(error => {
        this.messages = [
          { severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro:' + error, life: 3000 },
        ];
      });
      this.form.reset();
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha os campos!', life: 3000 },
      ];
      this.mssM = 'Matrícula inválida.';
      this.mssS = 'Senha inválida! Mínimo de 6 caracteres.';
      this.errS = true;
      this.errM = true;
    }
  }
}
