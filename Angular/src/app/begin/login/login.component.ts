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
import { AutheticationDTO, LoginResponseDTO } from '../../models/usuario';
import { UsuarioService } from '../../_services/usuario.service';
import { UserAuthService } from '../../_services/user-auth.service';

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
    UsuarioService,
    UserAuthService
  ]
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  login!: AutheticationDTO;

  errM: boolean = false;
  errS: boolean = false;
  
  mssM: string = '';
  mssS: string = '';
  
  messages!: Message[];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    public userService: UsuarioService,
    private userAuthService: UserAuthService,
    ) {
      this.form = this.formBuilder.group({
        login: [null, [Validators.required]],
        password: [null, [Validators.required]],
      });
  }

  ngOnInit() {}

  navigateToPage() {
    this.router.navigate(['/registrar']);
  }

  isLogged() {
    return this.userAuthService.isLoggedIn();
  }
  
  onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.onSubmit();
    }
  }
  
  
  enviarForm() {
    this.userService.login(this.login).subscribe({
      next: (data: any) => {
        const loginResponse: LoginResponseDTO = data;
        this.userAuthService.setRole(loginResponse.role.toString())
        this.userAuthService.setToken(loginResponse.token)
        this.userAuthService.setNome(loginResponse.nome)
        this.userAuthService.setLogin(loginResponse.login)
        this.userAuthService.setTime();

        // const role = loginResponse.role.toString();
        
        // if(role == "ADMIN") {
        //   this.router.navigate(['alunos']).then(() => {
        //     window.location.reload();
        //   });
        // } else {
          this.router.navigate(['home']).then(() => {
            window.location.reload();
          });
        // }
        
      },
      error: (err: any) => {
        if (err.status === 400) {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Login ou senha inválidos!', life: 3000 },
          ];
        } else {
          this.messages = [
            { severity: 'error', summary: 'Erro inesperado', detail: 'Ocorreu um erro no login.\n Por favor, tente novamente.', life: 3000 },
          ];
        }

      }
    });
  }

  onSubmit() {
    console.log(this.form.value)
    if (this.form.valid) {
      this.login = this.form.value;
      this.enviarForm();
      this.form.reset();
    } else {
      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha os campos!', life: 3000 },
      ];
      this.mssM = 'Login inválida.';
      this.mssS = 'Senha inválida!';
      this.errS = true;
      this.errM = true;
    }
  }
}
