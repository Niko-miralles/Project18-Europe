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

const message = ({ email, subject, greeting, paragraphs, cta, url = editLink(email) }) => {
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

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'mirallesredes90@gmail.com';
const CALENDAR_URL = 'https://calendar.app.google/HxAFZcACa5ZDeQwA8';

const LABELS = {
  ambassador: [['name', 'Name'], ['country', 'Country'], ['batch', 'Batch'], ['email', 'Email'], ['whatsapp', 'WhatsApp'], ['linkedin', 'LinkedIn'], ['why', 'Why you'], ['notes', 'Notes']],
  sponsor: [['company', 'Company'], ['name', 'Contact'], ['role', 'Role'], ['email', 'Email'], ['website', 'Website'], ['country', 'Country'], ['interest', 'Interested in'], ['budget', 'Budget'], ['message', 'Goals']]
};

export const notificationEmail = entry => {
  const rows = LABELS[entry.type].filter(([key]) => entry[key]);
  const title =
    entry.type === 'ambassador'
      ? `New ambassador application: ${entry.name} (${entry.country}, ${entry.batch})`
      : `New sponsor request: ${entry.company} (${entry.name})`;
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#fff;font-family:${FONT};color:#111">
<h2 style="margin:0 0 16px;font-size:18px">${escapeHtml(title)}</h2>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;line-height:1.5">
${rows.map(([key, label]) => `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(entry[key])}</td></tr>`).join('')}
</table>
<p style="margin:20px 0 0;font-size:13px"><a href="${SITE_URL}/admin">Open the admin</a></p>
</body></html>`;
  const text = `${title}\n\n${rows.map(([key, label]) => `${label}: ${entry[key]}`).join('\n')}\n\nAdmin: ${SITE_URL}/admin`;
  return { from: FROM, to: [NOTIFY_EMAIL], reply_to: entry.email, subject: title, html, text };
};

export const formConfirmationEmail = entry =>
  entry.type === 'ambassador'
    ? message({
        email: entry.email,
        url: `${SITE_URL}/ambassadors`,
        subject: 'Your Project18 Europe ambassador application',
        greeting: `Hi ${firstName(entry.name)},`,
        paragraphs: [
          `Thanks for applying to be the Project18 Europe ambassador for ${entry.country}. We’ve received your application for the ${entry.batch} batch.`,
          'We read every application ourselves and we’ll get back to you before the batch starts.'
        ],
        cta: 'See the ambassador programme'
      })
    : message({
        email: entry.email,
        url: CALENDAR_URL,
        subject: 'Thanks for your interest in sponsoring Project18 Europe',
        greeting: `Hi ${firstName(entry.name)},`,
        paragraphs: [
          `Thanks for telling us about ${entry.company}. We’re excited to explore how you can help Europe’s best founders under 18.`,
          'If you haven’t booked a call yet, pick a time that works for you below.'
        ],
        cta: 'Book a call'
      });
