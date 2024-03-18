import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessoresRComponent } from './professores-r.component';

describe('ProfessoresRComponent', () => {
  let component: ProfessoresRComponent;
  let fixture: ComponentFixture<ProfessoresRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessoresRComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfessoresRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
