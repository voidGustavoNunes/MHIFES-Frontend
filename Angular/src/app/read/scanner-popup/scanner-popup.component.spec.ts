import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannerPopupComponent } from './scanner-popup.component';

describe('ScannerPopupComponent', () => {
  let component: ScannerPopupComponent;
  let fixture: ComponentFixture<ScannerPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannerPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScannerPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
