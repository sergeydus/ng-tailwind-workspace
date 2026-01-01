import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDirectiveLib } from './my-directive-lib';

describe('MyDirectiveLib', () => {
  let component: MyDirectiveLib;
  let fixture: ComponentFixture<MyDirectiveLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyDirectiveLib]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyDirectiveLib);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
