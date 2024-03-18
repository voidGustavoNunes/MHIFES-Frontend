import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlunosRComponent } from './alunos-r.component';

describe('AlunosRComponent', () => {
  let component: AlunosRComponent;
  let fixture: ComponentFixture<AlunosRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlunosRComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlunosRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
