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
import { HttpClientModule } from '@angular/common/http';
import { RegisterDTO, UserRole } from '../../models/usuario';
import { UsuarioService } from '../../_services/usuario.service';
import { DropdownModule } from 'primeng/dropdown';

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
    DropdownModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [
    ConfirmationService,
    MessageService,
    UsuarioService
  ]
})
export class RegisterComponent implements OnInit {
  errL: boolean = false;
  errN: boolean = false;
  errP: boolean = false;
  errR: boolean = false;
  
  mssL: string = '';
  mssN: string = '';
  mssP: string = '';
  mssR: string = '';
  
  messages!: Message[];

  form: FormGroup;
  user!: RegisterDTO;

  // papeisRole: { label: string, papel: UserRole }[] = [];
  papeisRole: UserRole[] = [UserRole.ADMIN, UserRole.USER];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UsuarioService,
    ) {
      this.form = this.formBuilder.group({
        login: [null, [Validators.required]],
        nome: [null, [Validators.required]],
        password: [null, [Validators.required]],
        role: [null, [Validators.required]]
      })
  }

  ngOnInit() {
  }
  
  onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.onSubmit();
    }
  }

  enviarForm() {
    this.userService.register(this.user).subscribe({
      next: (data: any) => {
        this.user = data;
        // this.ngOnInit();
        this.messages = [
          { severity: 'success', summary: 'Sucesso', detail: 'Usuário registrado com sucesso!', life: 3000 },
        ];
        // setTimeout(() => {
        //   this.router.navigate(['login']).then(() => {
        //     window.location.reload();
        //   });
        // }, 3000);
      },
      error: (err: any) => {
        if (err.status === 400) {
          this.messages = [
            { severity: 'error', summary: 'Erro', detail: 'Login já existente!', life: 3000 },
          ];
        } else {
          this.messages = [
            { severity: 'error', summary: 'Erro inesperado', detail: 'Ocorreu um erro durante o registro.\nPor favor, tente novamente.', life: 3000 },
          ];
        }

      }
    });
  }

  onSubmit() {
    console.log(this.form.value)
    if(this.form.valid) {
      this.user = this.form.value;
      this.enviarForm();
      this.errL = false;
      this.errN = false;
      this.errP = false;
      this.errR = false;
    } else {
      let log = this.form.get('login')?.value;
      let nom = this.form.get('nome')?.value;
      let pas = this.form.get('password')?.value;
      let rol = this.form.get('role')?.value;
      if(!log) {
        this.errL = true;
        this.mssL = 'Por favor insira um login de usuário.';
      }
      if(!nom) {
        this.errN = true;
        this.mssN = 'Por favor insira um nome de usuário.';
      }
      if(!pas) {
        this.errP = true;
        this.mssP = 'Por favor insira uma senha.';
      }
      if(!rol) {
        this.errR = true;
        this.mssR = 'Defina um papel de usuário.';
      }

      this.messages = [
        { severity: 'warn', summary: 'Atenção', detail: 'Informação inválida. Preencha os campos!', life: 3000 },
      ];
    }
  }

}
