import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipamentosRComponent } from './equipamentos-r.component';

describe('EquipamentosRComponent', () => {
  let component: EquipamentosRComponent;
  let fixture: ComponentFixture<EquipamentosRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipamentosRComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EquipamentosRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
