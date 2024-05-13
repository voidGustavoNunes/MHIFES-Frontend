import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelatoriosRComponent } from './relatorios-r.component';

describe('PeriodosRComponent', () => {
  let component: RelatoriosRComponent;
  let fixture: ComponentFixture<RelatoriosRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatoriosRComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RelatoriosRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
