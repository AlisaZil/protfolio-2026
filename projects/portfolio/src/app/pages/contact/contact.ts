import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Alert, Button, ButtonConfig, Icon, InputField } from 'ui';
import { SlideIn } from '../../shared/slide-in';
import { LanguageService } from '../../language/language.service';
import { PROFILE, SOCIAL_LINKS } from '../../profile';
import { SocialClicks } from '../../social-clicks';
import { ContactService, SendResult } from './contact.service';

type Field = 'name' | 'email' | 'message';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, Alert, Button, Icon, InputField, SlideIn],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly contactService = inject(ContactService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly language = inject(LanguageService);
  protected readonly profile = PROFILE;
  protected readonly socials = SOCIAL_LINKS;
  protected readonly socialClicks = inject(SocialClicks);
  protected readonly mailIcon = { name: 'mail', size: 20 } as const;

  protected readonly submitButton = computed<ButtonConfig>(() => ({
    label: this.language.t('contact.form.submit'),
    type: 'submit',
    icon: 'arrow-right',
    size: 'lg',
    loading: this.sending(),
  }));

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(2000)],
    }),
  });

  /** True after a submit attempt, so all errors show even on untouched fields. */
  private readonly submitAttempted = signal(false);
  protected readonly sending = signal(false);
  /** After sending: who sent it and how it went out, for the thank-you note. */
  protected readonly sent = signal<{ name: string; result: SendResult } | null>(null);
  protected readonly sendFailed = signal(false);

  /** Error message for a field, once the user has visited it or tried to submit. */
  protected errorFor(field: Field): string | null {
    const control = this.form.controls[field];
    if (control.valid || !(control.touched || this.submitAttempted())) return null;
    // Messages live in public/translations.json under "contact.errors.<field>.<error>".
    const key = `contact.errors.${field}.${Object.keys(control.errors ?? {})[0]}`;
    const message = this.language.t(key);
    return message === key ? this.language.t('contact.errors.fallback') : message;
  }

  protected async submit(): Promise<void> {
    if (this.sending()) return;
    this.submitAttempted.set(true);
    this.sent.set(null);
    this.sendFailed.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Move focus to the first field with a problem.
      afterNextRender(
        () => this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
        { injector: this.injector },
      );
      return;
    }

    const message = this.form.getRawValue();
    this.sending.set(true);
    try {
      const result = await this.contactService.send(message);
      this.sent.set({ name: message.name, result });
      this.form.reset();
      this.submitAttempted.set(false);
    } catch {
      this.sendFailed.set(true); // the form keeps what they typed, so they can try again
    } finally {
      this.sending.set(false);
    }
  }
}
