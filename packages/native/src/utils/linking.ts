import { Linking } from 'react-native';

const cleanPhone = (n: string) => n.replace(/[^+\d]/g, '');

/** Open the dialer for a phone number. */
export const callNumber = (n: string) => Linking.openURL(`tel:${cleanPhone(n)}`).catch(() => {});

/** Open the SMS composer for a phone number. */
export const smsNumber = (n: string) => Linking.openURL(`sms:${cleanPhone(n)}`).catch(() => {});

/** Open the mail composer for an email address. */
export const sendEmail = (e: string) => Linking.openURL(`mailto:${e.trim()}`).catch(() => {});
