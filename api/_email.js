import process from 'node:process';
import { applyToken } from './_lib.js';

const SITE_URL = process.env.SITE_URL || 'https://project18.eu';
const FROM = 'Project18 Europe <hello@project18.eu>';
const REPLY_TO = 'info@project18.eu';

export const editLink = email => `${SITE_URL}/?apply=${applyToken(email)}`;

export const resend = async (path, body, method = 'POST') => {
  if (!process.env.RESEND_API_KEY) return null;
  const res = await fetch(`https://api.resend.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Resend ${res.status}`);
  return data;
};

export const addContact = async email => {
  const segment = process.env.RESEND_SEGMENT_ID;
  try {
    await resend('/contacts', { email, unsubscribed: false, ...(segment && { segments: [{ id: segment }] }) });
  } catch {
    // Contact may already exist; the waitlist itself is stored in Redis.
  }
};

export const removeContact = async email => {
  try {
    await resend(`/contacts/${encodeURIComponent(email)}`, null, 'DELETE');
  } catch {
    // Contact may not exist in Resend.
  }
};

const escapeHtml = value => String(value).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

const firstName = name => String(name || '').trim().split(/\s+/)[0] || 'there';

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const fill = color => `background-color:${color};background-image:linear-gradient(${color},${color})`;
const keep = html => `<div class="gs"><div class="gd">${html}</div></div>`;

const message = ({ email, subject, greeting, paragraphs, cta }) => {
  const url = editLink(email);
  const rows = [greeting, ...paragraphs]
    .map(p => `<tr><td style="font-size:15px;line-height:1.6;color:#bdbdbd;padding-bottom:16px">${keep(escapeHtml(p))}</td></tr>`)
    .join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<style>:root{color-scheme:dark}u + .body .gs{background:#000;mix-blend-mode:screen}u + .body .gd{background:#000;mix-blend-mode:difference}</style></head>
<body class="body" style="margin:0;padding:0;background:#000">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#000000" style="${fill('#000')}"><tr><td align="center" style="padding:48px 16px;font-family:${FONT}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">
<tr><td style="padding-bottom:16px"><img src="${SITE_URL}/email-logo.png" width="96" height="42" alt="" style="display:block;border:0;outline:none;width:96px;height:42px"></td></tr>
<tr><td style="font-size:13px;letter-spacing:5px;color:#fff;padding-bottom:36px">${keep('PROJECT18 EUROPE')}</td></tr>
${rows}
<tr><td style="padding:12px 0 40px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:8px;padding:1px;${fill('#fff')}"><a href="${url}" style="display:block;border-radius:7px;${fill('#000')};color:#fff;text-decoration:none;font-size:14px;padding:12px 23px">${keep(escapeHtml(cta))}</a></td></tr></table></td></tr>
<tr><td style="height:1px;line-height:1px;font-size:0;${fill('#1f1f1f')}">&nbsp;</td></tr>
<tr><td style="font-size:12px;line-height:1.7;color:#6b6b6b;padding-top:20px">${keep('Europe’s community for ambitious founders under 18.<br>Questions? Reply to this email or write to info@project18.eu.')}</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${[greeting, ...paragraphs].join('\n\n')}\n\n${cta}: ${url}\n\n—\nProject18 Europe\nEurope’s community for ambitious founders under 18.\nQuestions? Reply to this email or write to info@project18.eu.`;
  return { from: FROM, to: [email], reply_to: REPLY_TO, subject, html, text };
};

export const reminderEmail = (email, name) =>
  message({
    email,
    subject: 'Finish your Project18 Europe application',
    greeting: `Hi ${firstName(name)},`,
    paragraphs: [
      'You started your application to Project18 Europe but haven’t finished it yet.',
      'Your answers are saved, so you can pick up right where you left off.'
    ],
    cta: 'Continue your application'
  });

export const confirmationEmail = (email, name) =>
  message({
    email,
    subject: 'Your Project18 Europe application',
    greeting: `Hi ${firstName(name)},`,
    paragraphs: [
      'Thanks for applying to Project18 Europe. We’ve received your application and we’ll be in touch.',
      'If you want to change anything, you can edit your answers with your personal link.'
    ],
    cta: 'Edit your application'
  });
