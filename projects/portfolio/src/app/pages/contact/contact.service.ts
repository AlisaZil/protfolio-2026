import { HttpClient } from '@angular/common/http';
import { DOCUMENT, Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PROFILE } from '../../profile';

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

/**
 * Web3Forms access key (free, from https://web3forms.com, sent to the email you sign up with).
 * Messages are delivered to that email. The key is designed to be public, so it's fine here.
 * While it's empty, the form falls back to opening the visitor's email app.
 */
export const WEB3FORMS_ACCESS_KEY = '';

/** How a message went out: straight to the inbox, or handed to the visitor's email app. */
export type SendResult = 'sent' | 'email-app';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  /** Rejects if the message couldn't be delivered. */
  async send(message: ContactMessage): Promise<SendResult> {
    if (!WEB3FORMS_ACCESS_KEY) {
      this.openEmailApp(message);
      return 'email-app';
    }

    const response = await firstValueFrom(
      this.http.post<{ success: boolean; message?: string }>('https://api.web3forms.com/submit', {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `New message from ${message.name} (portfolio)`,
        from_name: 'Portfolio contact form',
        replyto: message.email,
        name: message.name,
        email: message.email,
        message: message.message,
      }),
    );
    if (!response.success) throw new Error(response.message ?? 'Sending failed');
    return 'sent';
  }

  private openEmailApp({ name, email, message }: ContactMessage): void {
    const subject = `New message from ${name}`;
    const body = `${message}\n\n— ${name} (${email})`;
    const url =
      `mailto:${PROFILE.email}` +
      `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    this.document.defaultView?.location.assign(url);
  }
}
