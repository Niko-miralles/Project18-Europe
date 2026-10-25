import { useState } from 'react';
import './ApplyForm.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ApplyForm = ({ type, fields, values, onChange, submitLabel = 'Submit', onDone }) => {
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const set = (name, value) => {
    onChange({ ...values, [name]: value });
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const submit = async e => {
    e.preventDefault();
    if (status === 'sending') return;
    const next = {};
    for (const f of fields) {
      const v = (values[f.name] ?? '').trim();
      if (f.required && !v) next[f.name] = 'Required';
      else if (f.type === 'email' && v && !EMAIL.test(v)) next[f.name] = 'Enter a valid email';
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    setStatus('sending');
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...values })
    }).catch(() => null);
    if (!res?.ok) {
      setStatus('error');
      return;
    }
    setStatus('idle');
    onDone?.();
  };

  return (
    <form className="af" onSubmit={submit} noValidate>
      <div className="af-grid">
        {fields.map(f => {
          const id = `af-${type}-${f.name}`;
          const common = {
            id,
            name: f.name,
            value: values[f.name] ?? '',
            placeholder: f.placeholder,
            'aria-invalid': Boolean(errors[f.name]),
            onChange: e => set(f.name, e.target.value)
          };
          return (
            <label key={f.name} className={`af-field${f.wide ? ' is-wide' : ''}`} htmlFor={id}>
              <span className="af-label">
                {f.label}
                {!f.required && <em> · optional</em>}
              </span>
              {f.type === 'select' ? (
                <select {...common}>
                  <option value="" disabled>
                    {f.placeholder || 'Choose one'}
                  </option>
                  {f.options.map(o => {
                    const [value, label] = Array.isArray(o) ? o : [o, o];
                    return (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea rows={f.rows || 4} {...common} />
              ) : (
                <input type={f.type || 'text'} autoComplete={f.autoComplete || 'off'} inputMode={f.inputMode} {...common} />
              )}
              {errors[f.name] && <span className="af-error">{errors[f.name]}</span>}
            </label>
          );
        })}
      </div>
      <div className="af-foot">
        <button type="submit" className="ls-apply" aria-busy={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : submitLabel}
        </button>
        {status === 'error' && <p className="af-error">Something went wrong. Please try again.</p>}
      </div>
    </form>
  );
};

export default ApplyForm;
