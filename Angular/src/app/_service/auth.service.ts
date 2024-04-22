import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { LoginUser, Pessoa, UsuarioPadrao } from '../models/pessoa.models';
import { AlunoService } from '../service/aluno.service';
import { ProfessorService } from '../service/professor.service';
import { Aluno } from '../models/aluno.models';
import { Professor } from '../models/professor.models';
import { log } from 'console';
import { UsuarioPadraoService } from '../service/usuario-padrao.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private userAutenticado: boolean = false;
    private readonly STORAGE_KEY = 'session_profile';
    private mostrarCadastro = new EventEmitter<boolean>();
    private professorUser!: Professor | null;
    private alunoUser!: Aluno | null;
    private encontradoUser: boolean = false;
    resposta: string = '';
    severity: number = -1;

    constructor(
        private router: Router,
        private alunService: AlunoService,
        private professorService: ProfessorService,
        private padraoService: UsuarioPadraoService,
    ) { }

    fazerLogin(login: LoginUser): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.encontradoUser = false;

            if(!this.encontradoUser) {
                this.alunService.listar()
                .subscribe({
                    next: (itens: any) => {
                        const data = itens;
                        let alunoData: Aluno[] = data.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1);

                        alunoData.forEach(aluno => {
                            if (!this.encontradoUser && login.matricula == aluno.matricula && login.senha == aluno.senha) {
                                if(aluno.nomeUser != null && aluno.senha != null) {
                                    this.encontradoUser = false;

                                    const currentUser = { nomeUser: aluno.nomeUser, tipo: 3 };
                                    this.armazenarPerfil(currentUser);
                                    this.updateAutenticacao(true);
                                    resolve(0);
                                    return;
                                }
                            } else if(!this.encontradoUser && login.matricula != aluno.matricula && login.senha == aluno.senha) {
                                resolve(1);
                                return;
                            } else if(!this.encontradoUser && login.matricula == aluno.matricula && login.senha != aluno.senha) {
                                resolve(2);
                                return;
                            }
                        })
                        resolve(-1);
                    },
                    error: (error: any) => {
                        reject(error);
                    }
                });
            } else {
                resolve(-1);
            }
            
            if(!this.encontradoUser) {
                this.professorService.listar()
                .subscribe({
                    next: (itens: any) => {
                        const data = itens;
                        let professorData: Professor[] = data.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1);
                        professorData.forEach(professor => {
                            if (!this.encontradoUser && login.matricula == professor.matricula && login.senha == professor.senha && professor.ehCoordenador) {
                                if(professor.nomeUser != null && professor.senha != null) {
                                    this.encontradoUser = true;
                                    
                                    const currentUser = { nomeUser: professor.nomeUser, tipo: 2 };
                                    this.armazenarPerfil(currentUser);
                                    this.updateAutenticacao(true);
                                    resolve(0);
                                    return;
                                }
                            } else if(!this.encontradoUser && login.matricula != professor.matricula && login.senha == professor.senha && professor.ehCoordenador) {
                                resolve(1);
                                return;
                            } else if(!this.encontradoUser && login.matricula == professor.matricula && login.senha != professor.senha && professor.ehCoordenador) {
                                resolve(2);
                                return;
                            }
                        })
                        resolve(-1);
                    },
                    error: (error: any) => {
                        reject(error);
                    }
                });
            } else {
                resolve(-1);
            }
            
            if(!this.encontradoUser) {
                this.padraoService.listar()
                .subscribe({
                    next: (itens: any) => {
                        const data = itens;
                        let padraoData: UsuarioPadrao[] = data;
                        padraoData.forEach(padrao => {
                            if (!this.encontradoUser && login.matricula == padrao.matricula && login.senha == padrao.senha) {
                                if(padrao.nomeUser != null && padrao.senha != null) {
                                    this.encontradoUser = true;
                                    
                                    const currentUser = { nomeUser: padrao.nomeUser, tipo: 1 };
                                    this.armazenarPerfil(currentUser);
                                    this.updateAutenticacao(true);
                                    resolve(0);
                                    return;
                                }
                            } else if(!this.encontradoUser && login.matricula != padrao.matricula && login.senha == padrao.senha) {
                                resolve(1);
                                return;
                            } else if(!this.encontradoUser && login.matricula == padrao.matricula && login.senha != padrao.senha) {
                                resolve(2);
                                return;
                            }
                        })
                        resolve(-1);
                    },
                    error: (error: any) => {
                        reject(error);
                    }
                });
            } else {
                resolve(-1);
            }
        });
    }

    fazerLogout() {
        // localStorage.removeItem(this.STORAGE_KEY);
        // sessionStorage.removeItem(this.STORAGE_KEY);
        // this.updateAutenticacao(false);
        // this.router.navigateByUrl('/').then(() => {
        //     window.location.reload();
        // });
    }

    private updateAutenticacao(bool: boolean) {
        // this.userAutenticado = bool;
        // this.mostrarCadastro.emit(this.userAutenticado);
    }

    getPerfil() {
        // if (typeof localStorage !== 'undefined') {
        //     const profileJson = localStorage.getItem(this.STORAGE_KEY);
        //     if (!profileJson) {
        //         return null;
        //     }

        //     try {
        //         const profile = JSON.parse(profileJson);
        //         return profile;
        //     } catch (err) {
        //         console.error('Erro ao fazer parse do objeto JSON', err);
        //         return null;
        //     }
        //   } else if (typeof sessionStorage !== 'undefined') {
        //     const profileJson = sessionStorage.getItem(this.STORAGE_KEY);
        //     if (!profileJson) {
        //         return null;
        //     }

        //     try {
        //         const profile = JSON.parse(profileJson);
        //         return profile;
        //     } catch (err) {
        //         console.error('Erro ao fazer parse do objeto JSON', err);
        //         return null;
        //     }
        //   }
                return null;
    }

    private armazenarPerfil(profile: any) {
        // const profileJson = JSON.stringify(profile);
        // sessionStorage.setItem(this.STORAGE_KEY, profileJson)
        // localStorage.setItem(this.STORAGE_KEY, profileJson);
    }

    verificarRegisterLogData(user: Pessoa) {
        this.professorUser = null;
        this.alunoUser = null;
        this.encontradoUser = false;

        if(!this.encontradoUser && this.alunoUser == null) {
            this.alunService.listar()
            .subscribe({
                next: (itens: any) => {
                    const data = itens;
                    let alunoData: Aluno[] = data.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1);

                    alunoData.forEach(aluno => {
                        if (!this.encontradoUser && user.matricula == aluno.matricula) {
                            if(aluno.nomeUser == null && aluno.senha == null) {
                                this.alunoUser = aluno;
                                this.alunoUser.nomeUser = user.nomeUser;
                                this.alunoUser.senha = user.senha;
                                this.encontradoUser = true;
                            } else if(aluno.nomeUser != null && aluno.senha != null) {
                                this.severity = 2;
                                this.resposta = 'Usuário já existente.';
                                this.encontradoUser = false;
                            }
                        }
                    })
                    if(this.encontradoUser && this.alunoUser != null) {
                        this.saveUserAluno();
                    }
                }
            });
        }
        
        if(!this.encontradoUser && this.professorUser == null) {
            this.professorService.listar()
            .subscribe({
                next: (itens: any) => {
                    const data = itens;
                    let professorData: Professor[] = data.sort((a: any, b: any) => (a.nome < b.nome) ? -1 : 1);
                    professorData.forEach(professor => {
                        if (!this.encontradoUser && user.matricula == professor.matricula && professor.ehCoordenador) {
                            if(professor.nomeUser == null && professor.senha == null) {
                                this.professorUser = professor;
                                this.professorUser.nomeUser = user.nomeUser;
                                this.professorUser.senha = user.senha;
                                this.encontradoUser = true;
                            } else if(professor.nomeUser != null && professor.senha != null) {
                                this.severity = 2;
                                this.resposta = 'Usuário já existente.';
                                this.encontradoUser = false;
                            }
                        }
                    })
                    
                    if(this.encontradoUser && this.professorUser != null) {
                        this.saveUserCoordenador();
                    }
                }
            });
        }
    }

    private saveUserAluno() {
        if (this.alunoUser !== null) {
            this.alunService.atualizar(this.alunoUser.id, this.alunoUser).subscribe({
                next: (data: any) => {
                    this.alunoUser = data;
                    if (this.alunoUser != null) {
                        this.severity = 1;
                        this.resposta = 'Usuário cadastrado com sucesso!';
                    }
                },
                error: (err: any) => {
                    this.severity = 3;
                    this.resposta = 'Cadastro não enviado.';
                }
            });
        }
    }

    private saveUserCoordenador() {
        if (this.professorUser !== null) {
            this.professorService.atualizar(this.professorUser.id, this.professorUser).subscribe({
                next: (data: any) => {
                    this.professorUser = data;
                    if (this.professorUser != null) {
                        this.severity = 1;
                        this.resposta = 'Usuário cadastrado com sucesso!\nAguarde você será redirecionado para a página de Login.';
                    }
                },
                error: (err: any) => {
                    this.severity = 3;
                    this.resposta = 'Cadastro não enviado.';
                }
            });
        }
    }
}