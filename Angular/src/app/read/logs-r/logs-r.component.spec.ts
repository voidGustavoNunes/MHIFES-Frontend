import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogsRComponent } from './logs-r.component';

describe('LogsRComponent', () => {
  let component: LogsRComponent;
  let fixture: ComponentFixture<LogsRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogsRComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LogsRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
