import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from './language-selector.component';
import { TranslationService } from '@app/services/core/translation.service';

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;
  let translationServiceSpy: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    translationServiceSpy = jasmine.createSpyObj('TranslationService', ['getCurrentLanguage', 'setLanguage']);

    await TestBed.configureTestingModule({
      declarations: [LanguageSelectorComponent],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: TranslationService, useValue: translationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current language from service', () => {
    translationServiceSpy.getCurrentLanguage.and.returnValue('es');
    fixture.detectChanges();
    expect(component.currentLanguage).toBe('es');
  });

  it('should render language selector with available options', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const select = compiled.querySelector('ion-select');
    const options = select.querySelectorAll('ion-select-option');

    expect(select).toBeTruthy();
    expect(options.length).toBe(2);
    expect(options[0].value).toBe('es');
    expect(options[0].textContent).toBe('Español');
    expect(options[1].value).toBe('en');
    expect(options[1].textContent).toBe('English');
  });

  it('should call translation service when language is changed', async () => {
    translationServiceSpy.getCurrentLanguage.and.returnValue('es');
    translationServiceSpy.setLanguage.and.returnValue(Promise.resolve());
    fixture.detectChanges();

    const event = {
      detail: {
        value: 'en'
      }
    };

    await component.onLanguageChange(event);

    expect(translationServiceSpy.setLanguage).toHaveBeenCalledWith('en');
  });

  it('should handle errors when changing language', async () => {
    translationServiceSpy.getCurrentLanguage.and.returnValue('es');
    translationServiceSpy.setLanguage.and.returnValue(Promise.reject('Error'));
    fixture.detectChanges();

    const event = {
      detail: {
        value: 'en'
      }
    };

    try {
      await component.onLanguageChange(event);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBe('Error');
    }
  });

  it('should update currentLanguage when language is changed', async () => {
    translationServiceSpy.getCurrentLanguage.and.returnValue('es');
    translationServiceSpy.setLanguage.and.returnValue(Promise.resolve());
    fixture.detectChanges();

    const event = {
      detail: {
        value: 'en'
      }
    };

    await component.onLanguageChange(event);
    expect(component.currentLanguage).toBe('en');
  });

  it('should maintain current language when translation service fails', async () => {
    translationServiceSpy.getCurrentLanguage.and.returnValue('es');
    translationServiceSpy.setLanguage.and.returnValue(Promise.reject('Error'));
    fixture.detectChanges();

    const event = {
      detail: {
        value: 'en'
      }
    };

    try {
      await component.onLanguageChange(event);
    } catch (error) {
      expect(component.currentLanguage).toBe('es');
    }
  });
});