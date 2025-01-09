import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestRegComponent } from './test-reg.component';

describe('TestRegComponent', () => {
  let component: TestRegComponent;
  let fixture: ComponentFixture<TestRegComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestRegComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestRegComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
