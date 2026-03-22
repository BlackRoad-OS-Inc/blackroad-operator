import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";

export interface Question {
  id: string;
  text: string;
  kind: "boolean" | "text" | "select";
  options?: string[];
  when?: { questionId: string; equals?: any; notEquals?: any; regex?: string }[];
  defaultValue?: any;
}

export interface WizardProps {
  questions: Question[];
  initialAnswers?: Record<string, any>;
  onChange?(answers: Record<string, any>): void;
}

export interface WizardRef {
  reset(): void;
  getAnswers(): Record<string, any>;
  setAnswers(answers: Record<string, any>): void;
}

export const Wizard = forwardRef<WizardRef, WizardProps>(
  ({ questions, initialAnswers = {}, onChange }, ref) => {
    // Build default answers from question defaults and initialAnswers
    const buildDefaults = () => {
      const defaults: Record<string, any> = {};
      questions.forEach((q) => {
        if (q.defaultValue !== undefined) {
          defaults[q.id] = q.defaultValue;
        } else if (q.kind === "boolean") {
          defaults[q.id] = false;
        } else if (q.kind === "text") {
          defaults[q.id] = "";
        } else if (q.kind === "select" && q.options && q.options.length > 0) {
          defaults[q.id] = q.options[0];
        }
      });
      return { ...defaults, ...initialAnswers };
    };

    const [answers, setAnswers] = useState<Record<string, any>>(buildDefaults);

    // Update answers if initialAnswers prop changes
    useEffect(() => {
      const defaults = buildDefaults();
      setAnswers(defaults);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialAnswers]);

    // Expose imperative methods via ref
    useImperativeHandle(ref, () => ({
      reset() {
        const defaults = buildDefaults();
        setAnswers(defaults);
        onChange?.(defaults);
      },
      getAnswers() {
        return { ...answers };
      },
      setAnswers(newAnswers: Record<string, any>) {
        setAnswers({ ...newAnswers });
        onChange?.(newAnswers);
      },
    }));

    const visible = (q: Question) =>
      !q.when ||
      q.when.every((g) => {
        const val = answers[g.questionId];
        if (g.equals !== undefined && val !== g.equals) return false;
        if (g.notEquals !== undefined && val === g.notEquals) return false;
        if (g.regex && !(typeof val === "string" && new RegExp(g.regex).test(val))) return false;
        return true;
      });

    const update = (id: string, val: any) => {
      const next = { ...answers, [id]: val };
      setAnswers(next);
      onChange?.(next);
    };

    return (
      <div>
        {questions.filter(visible).map((q) => (
          <label key={q.id}>
            {q.text}
            {q.kind === "boolean" && (
              <input
                type="checkbox"
                checked={answers[q.id] ?? false}
                onChange={(e) => update(q.id, e.target.checked)}
              />
            )}
            {q.kind === "text" && (
              <input
                type="text"
                value={answers[q.id] ?? ""}
                onChange={(e) => update(q.id, e.target.value)}
              />
            )}
            {q.kind === "select" && (
              <select value={answers[q.id] ?? ""} onChange={(e) => update(q.id, e.target.value)}>
                {q.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>
    );
  }
);

export default Wizard;
