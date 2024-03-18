import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisciplinasRComponent } from './disciplinas-r.component';

describe('DisciplinasRComponent', () => {
  let component: DisciplinasRComponent;
  let fixture: ComponentFixture<DisciplinasRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisciplinasRComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DisciplinasRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
