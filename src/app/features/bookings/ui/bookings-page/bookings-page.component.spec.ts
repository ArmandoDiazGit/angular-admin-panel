import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { BookingsPageComponent } from './bookings-page.component';
import { BookingsStore } from '../../data/bookings-store';

describe('BookingsPageComponent', () => {
  let component: BookingsPageComponent;
  let fixture: ComponentFixture<BookingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingsPageComponent],
      providers: [
        BookingsStore,
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
