import { Injectable } from '@angular/core';
import { send } from '@emailjs/browser';

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

/**
 * EmailJS settings, from your free account at https://www.emailjs.com.
 * These IDs are designed to be public, so it's fine to keep them in the site's code.
 *
 * The template can use: {{name}}, {{email}}, {{message}} and {{title}}.
 */
export const EMAILJS = {
  serviceId: '',
  templateId: '',
  publicKey: '',
};

/** Sends contact-form messages to your inbox through EmailJS. */
@Injectable({ providedIn: 'root' })
export class ContactService {
  /** Rejects if the message couldn't be sent. */
  async send({ name, email, message }: ContactMessage): Promise<void> {
    const { serviceId, templateId, publicKey } = EMAILJS;
    if (!serviceId || !templateId || !publicKey) {
      throw new Error('EmailJS is not set up yet: add the IDs in contact.service.ts');
    }

    await send(
      serviceId,
      templateId,
      { name, email, message, title: `New message from ${name} (portfolio)` },
      { publicKey },
    );
  }
}
