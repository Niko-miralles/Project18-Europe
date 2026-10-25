import { useEffect, useMemo, useRef, useState } from "react";
import GlobeMark from "./GlobeMark";
import "./Application.css";

const STORAGE_KEY = "yef-applications";

const pad = (n) => String(n).padStart(2, "0");

const formatDob = (raw) => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join(" / ");
};

const parseDob = (value) => {
  const d = (value ?? "").replace(/\D/g, "");
  if (d.length !== 8) return null;
  const [day, month, year] = [d.slice(0, 2), d.slice(2, 4), d.slice(4)].map(
    Number,
  );
  const date = new Date(year, month - 1, day);
  const valid =
    year >= 1900 &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  return valid ? `${pad(day)}/${pad(month)}/${year}` : null;
};

const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const MAX_SUGGESTIONS = 6;

const isLink = (value) => /^\S+\.\S+$/.test(value);

const isPhone = (value) => /^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 8 && value.replace(/\D/g, "").length <= 15;

const QUESTIONS = [
  {
    id: "interest",
    title: "What are you interested in?",
    hint: "Tell us what you want from Project18 Europe.",
    type: "choice",
    options: [{ value: "Community" }, { value: "Barcelona 2027" }, { value: "Both" }],
  },
  {
    id: "name",
    title: "What’s your name?",
    placeholder: "Your full name",
    autoComplete: "name",
  },
  {
    id: "dob",
    title: "When were you born?",
    hint: "We’re looking for founders who will be under 18 during Project18 Barcelona 2027.",
    type: "dob",
    placeholder: "DD / MM / YYYY",
    inputMode: "numeric",
    autoComplete: "bday",
  },
  {
    id: "location",
    title: "Where are you based?",
    hint: "Start typing and pick your city.",
    placeholder: "Barcelona, Spain",
    type: "city",
  },
  {
    id: "building",
    title: "What are you building right now?",
    hint: "Tell us what it is in 1–2 sentences.",
    placeholder: "Tell us in 1–2 sentences…",
    multiline: true,
  },
  {
    id: "built",
    title: "Show us something you’ve built.",
    hint: "Product, GitHub, website, demo, App Store, project…",
    placeholder: "Paste a link",
    inputMode: "url",
    validate: (v) => (isLink(v) ? "" : "Please paste a valid link."),
  },
  {
    id: "coolest",
    title: "What’s the coolest thing you’ve built or done?",
    hint: "It doesn’t have to be a company.",
    placeholder: "Short answer",
    multiline: true,
  },
  {
    id: "future",
    title: "What do you want to build in the next 3 years?",
    placeholder: "Short answer",
    multiline: true,
  },
  {
    id: "links",
    title: "Where can we find you?",
    hint: "X, LinkedIn, GitHub or personal website. One is enough.",
    placeholder: "x.com/yourname",
  },
  {
    id: "barcelona",
    when: (a) => a.interest !== "Community",
    title: "Could you join Project18 Barcelona 2027?",
    hint: "Our first gathering: 30–40 founders, one weekend in Barcelona.",
    hintStrong: "Travel, accommodation and meals covered.",
    type: "choice",
    options: [
      { value: "Yes" },
      { value: "Maybe", note: "Tell us a bit more (optional)" },
      { value: "No" },
    ],
  },
  {
    id: "video",
    title: "Optional: Introduce yourself in a short video.",
    hint: "Tell us who you are, what you’re building, or anything you think we should know. No editing needed — just be yourself.",
    hintStrong: "Max. 60 seconds.",
    type: "video",
    placeholder: "Video link",
    inputMode: "url",
  },
  {
    id: "whatsapp",
    title: "What’s your WhatsApp?",
    hint: "So we can contact you. Include your country code.",
    placeholder: "+34 600 000 000",
    inputMode: "tel",
    autoComplete: "tel",
    validate: (v) => (isPhone(v) ? "" : "Please enter a valid phone number."),
  },
  {
    id: "jobs",
    title: "Want to join our jobs program?",
    hint: "You’ll occasionally receive job offers from companies in our network on WhatsApp or email.",
    type: "choice",
    options: [{ value: "Yes" }, { value: "No" }],
  },
];

const ArrowLeft = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path
      d="M16 10H4M9 5l-5 5 5 5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRight = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path
      d="M4 10h12M11 5l5 5-5 5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const isVisible = (q, a) => !q.when || q.when(a);

const Application = ({ email, initialAnswers = {}, initialStep = 0, editing = false }) => {
  const legacy = Object.keys(initialAnswers).length > 0 && !initialAnswers.interest;
  const [step, setStep] = useState(() => initialStep + (legacy && initialStep > 0 ? 1 : 0));
  const [answers, setAnswers] = useState(() => ({
    ...initialAnswers,
    ...(legacy && { interest: "Both" }),
    ...(initialAnswers.dob && { dob: formatDob(initialAnswers.dob) }),
  }));
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [cities, setCities] = useState(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const fieldRef = useRef(null);
  const noteRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (action) => {
    if (leaving) return;
    setLeaving(true);
    timer.current = setTimeout(() => {
      action();
      setLeaving(false);
    }, 220);
  };

  const visible = QUESTIONS.filter((q) => isVisible(q, answers));
  const current = Math.min(step, visible.length - 1);
  const question = visible[current];
  const value = answers[question.id];
  const isLast = current === visible.length - 1;

  useEffect(() => {
    fieldRef.current?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => {
    if (question.type !== "city" || cities) return;
    import("../data/europe-cities.json").then((m) =>
      setCities(
        m.default.map(([city, country]) => {
          const label = `${city}, ${country}`;
          return { label, city: normalize(city), full: normalize(label) };
        }),
      ),
    );
  }, [question.type, cities]);

  const suggestions = useMemo(() => {
    if (question.type !== "city" || !cities) return [];
    const q = normalize(value ?? "");
    if (q.length < 2) return [];
    const out = [];
    for (const c of cities) {
      if (c.city.startsWith(q) || c.full.startsWith(q)) out.push(c.label);
      if (out.length === MAX_SUGGESTIONS) break;
    }
    if (out.length === 1 && normalize(out[0]) === q) return [];
    return out;
  }, [question.type, cities, value]);

  const showSuggestions = suggestOpen && suggestions.length > 0;

  const pickCity = (label) => {
    setAnswers((a) => ({ ...a, [question.id]: label }));
    setSuggestOpen(false);
    setError("");
  };

  useEffect(() => {
    if (value === "Maybe") noteRef.current?.focus({ preventScroll: true });
  }, [value]);

  const update = (v) => {
    setAnswers((a) => ({ ...a, [question.id]: v }));
    if (error) setError("");
  };

  const submit = async (final) => {
    const entry = {
      email,
      ...final,
      dob: parseDob(final.dob),
      submittedAt: new Date().toISOString(),
    };
    setSending(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setSending(false);
      setError("Something went wrong. Please try again.");
      return;
    }
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...saved.filter((a) => a.email !== email), entry]),
    );
    setDone(true);
  };

  const saveDraft = (draft, nextStep) => {
    fetch("/api/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, answers: draft, step: nextStep }),
      keepalive: true,
    }).catch(() => {});
  };

  const next = (e) => {
    e?.preventDefault();
    if (leaving || sending) return;
    let message = "";
    const clean = (value ?? "").trim();
    if (question.type === "video") {
      if (clean && !isLink(clean)) message = "Please paste a valid link.";
    } else if (question.type === "dob") {
      if (!parseDob(clean)) message = "Please enter a valid date.";
    } else if (question.type === "choice") {
      if (!clean) message = "Please choose one.";
    } else {
      message = !clean
        ? "This one is required."
        : (question.validate?.(clean) ?? "");
    }

    if (message) {
      setError(message);
      fieldRef.current?.focus({ preventScroll: true });
      return;
    }

    const final = { ...answers, [question.id]: clean };
    for (const q of QUESTIONS) {
      if (isVisible(q, final)) continue;
      delete final[q.id];
      delete final[`${q.id}Note`];
    }
    setAnswers(final);
    setError("");
    if (isLast) {
      submit(final);
      return;
    }
    saveDraft(final, current + 1);
    go(() => setStep(current + 1));
  };

  const back = () => {
    setError("");
    go(() => setStep(current - 1));
  };

  if (done) {
    return (
      <section className="apply apply-done" role="status">
        <GlobeMark className="apply-done-mark" label="" />
        <h2>{editing ? "Your application is updated." : "You’re on the list."}</h2>
        <p>
          {editing
            ? "We’ll be in touch with updates, events and next steps."
            : "We’ve sent you an email with your personal link, in case you want to change anything."}
        </p>
        <a className="apply-done-contact" href="mailto:info@project18.eu">
          info@project18.eu
        </a>
      </section>
    );
  }

  const fieldProps = {
    ref: fieldRef,
    id: `q-${question.id}`,
    className: `apply-input${error ? " is-invalid" : ""}`,
    placeholder: question.placeholder,
    value: value ?? "",
    onChange: (e) =>
      update(
        question.type === "dob" ? formatDob(e.target.value) : e.target.value,
      ),
    onKeyDown: (e) => {
      if (showSuggestions) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const step = e.key === "ArrowDown" ? 1 : -1;
          setHighlight((h) => (h + step + suggestions.length) % suggestions.length);
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          pickCity(suggestions[highlight] ?? suggestions[0]);
          return;
        }
        if (e.key === "Escape") {
          setSuggestOpen(false);
          return;
        }
      }
      if (e.key === "Enter" && !e.shiftKey) next(e);
    },
    autoComplete: question.autoComplete ?? "off",
    inputMode: question.inputMode,
    "aria-invalid": Boolean(error),
  };

  return (
    <form className="apply" onSubmit={next} noValidate>
      <header className="apply-head">
        <div className="apply-brand">
          <span>Project18 Europe</span>
        </div>
        <div className="apply-progress" aria-hidden="true">
          <span
            style={{ transform: `scaleX(${(current + 1) / visible.length})` }}
          />
        </div>
      </header>

      <div
        className={`apply-body${leaving ? " is-leaving" : ""}`}
        key={question.id}
      >
        <div className="apply-question">
          <h1>
            <label htmlFor={`q-${question.id}`}>{question.title}</label>
          </h1>
          {question.hint && (
            <p
              className={`apply-hint${question.hintStrong ? " is-wide" : ""}`}
            >
              {question.hint}
              {question.hintStrong && <strong> {question.hintStrong}</strong>}
            </p>
          )}
          <div className="apply-field">
            {question.type === "choice" ? (
              <>
                <div className="apply-choices" role="radiogroup">
                  {question.options.map((option, i) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      ref={i === 0 ? fieldRef : undefined}
                      id={i === 0 ? `q-${question.id}` : undefined}
                      aria-checked={value === option.value}
                      className={`apply-choice${value === option.value ? " is-selected" : ""}`}
                      onClick={() => {
                        setError("");
                        setAnswers((a) => ({
                          ...a,
                          [question.id]: option.value,
                          [`${question.id}Note`]: option.note
                            ? a[`${question.id}Note`]
                            : undefined,
                        }));
                      }}
                    >
                      {option.value}
                    </button>
                  ))}
                </div>
                {question.options.map(
                  (option) =>
                    option.note &&
                    value === option.value && (
                      <textarea
                        key={option.value}
                        ref={noteRef}
                        rows={3}
                        className="apply-input apply-choice-note"
                        placeholder={option.note}
                        aria-label={option.note}
                        value={answers[`${question.id}Note`] ?? ""}
                        onChange={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight + 2}px`;
                          setAnswers((a) => ({
                            ...a,
                            [`${question.id}Note`]: e.target.value,
                          }));
                        }}
                      />
                    ),
                )}
              </>
            ) : question.type === "city" ? (
              <div className="apply-city">
                <input
                  type="text"
                  {...fieldProps}
                  autoComplete="off"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions}
                  aria-controls="city-suggestions"
                  aria-activedescendant={showSuggestions ? `city-${highlight}` : undefined}
                  onChange={(e) => {
                    fieldProps.onChange(e);
                    setSuggestOpen(true);
                    setHighlight(0);
                  }}
                  onFocus={() => setSuggestOpen(true)}
                  onBlur={() => setSuggestOpen(false)}
                />
                {showSuggestions && (
                  <ul className="apply-suggestions" id="city-suggestions" role="listbox">
                    {suggestions.map((label, i) => (
                      <li
                        key={label}
                        id={`city-${i}`}
                        role="option"
                        aria-selected={i === highlight}
                        className={i === highlight ? "is-active" : undefined}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          pickCity(label);
                        }}
                        onMouseEnter={() => setHighlight(i)}
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : question.type === "video" ? (
              <input type="text" {...fieldProps} />
            ) : question.multiline ? (
              <textarea rows={3} {...fieldProps} />
            ) : (
              <input type="text" {...fieldProps} />
            )}
            <p className="apply-error" role="alert">
              {error}
            </p>
          </div>
        </div>

        <footer className="apply-foot">
          <button
            type="button"
            className="apply-back"
            onClick={back}
            disabled={current === 0}
            aria-hidden={current === 0}
          >
            <ArrowLeft />
            Back
          </button>
          <button type="submit" className="apply-next" aria-busy={sending}>
            {isLast
              ? sending
                ? "Sending…"
                : "Submit"
              : question.type === "video" && !value
                ? "Skip"
                : "Continue"}
            <ArrowRight />
          </button>
        </footer>
      </div>
    </form>
  );
};

export default Application;
