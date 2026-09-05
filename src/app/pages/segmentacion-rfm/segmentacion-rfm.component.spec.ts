import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentacionRfmComponent } from './segmentacion-rfm.component';

describe('SegmentacionRfmComponent', () => {
  let component: SegmentacionRfmComponent;
  let fixture: ComponentFixture<SegmentacionRfmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegmentacionRfmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SegmentacionRfmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
