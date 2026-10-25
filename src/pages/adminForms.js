export const AMBASSADOR_FIELDS = [
  ['batch', 'Batch'],
  ['country', 'Country'],
  ['email', 'Email'],
  ['whatsapp', 'WhatsApp'],
  ['linkedin', 'LinkedIn'],
  ['why', 'Why you'],
  ['notes', 'Notes']
];

export const SPONSOR_FIELDS = [
  ['name', 'Contact'],
  ['role', 'Role'],
  ['email', 'Email'],
  ['website', 'Website'],
  ['country', 'Country'],
  ['interest', 'Interested in'],
  ['budget', 'Budget'],
  ['message', 'Goals']
];

const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const exportCsv = (name, fields, entries, titleKey) => {
  const header = [titleKey === 'company' ? 'Company' : 'Name', ...fields.map(([, label]) => label), 'Submitted'];
  const rows = entries.map(e => [e[titleKey], ...fields.map(([key]) => e[key]), e.submittedAt]);
  const csv = [header, ...rows].map(r => r.map(csvCell).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  link.download = `project18-${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

