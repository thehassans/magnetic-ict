"use client";

import React, { useEffect, useMemo, useState, type CSSProperties } from "react";
import { MastercardMark, VisaMark } from "@/components/ui/payment-brand-icons";

type CardState = {
  number: string;
  holder: string;
  month: string;
  year: string;
  cvv: string;
};

type CardValidity = {
  number: boolean;
  holder: boolean;
  month: boolean;
  year: boolean;
  cvv: boolean;
  allValid: boolean;
};

type Props = {
  defaultNumber?: string;
  defaultHolder?: string;
  defaultMonth?: string;
  defaultYear?: string;
  defaultCVV?: string;
  maskMiddle?: boolean;
  ring1?: string;
  ring2?: string;
  showSubmit?: boolean;
  onChange?: (state: CardState, validity: CardValidity) => void;
  onSubmit?: (state: CardState, validity: CardValidity) => void;
  className?: string;
  layout?: "split" | "stacked";
};

function formatNumberSpaces(num: string) {
  return num.replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
}

function clampDigits(value: string, maxLen: number) {
  return value.replace(/\D/g, "").slice(0, maxLen);
}

function getCardNetwork(number: string) {
  const normalized = number.replace(/\D/g, "");

  if (/^4/.test(normalized)) {
    return "visa" as const;
  }

  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(normalized)) {
    return "mastercard" as const;
  }

  return "unknown" as const;
}

function getPreviewGroups(number: string, maskMiddle: boolean) {
  const normalized = number.replace(/\D/g, "").slice(0, 16);

  return Array.from({ length: 4 }, (_, index) => {
    const group = normalized.slice(index * 4, index * 4 + 4);

    if (!group) {
      return "";
    }

    if (maskMiddle && index > 0 && index < 3) {
      return "•".repeat(group.length);
    }

    return group;
  });
}

export function CreditCardForm({
  defaultNumber = "",
  defaultHolder = "",
  defaultMonth = "",
  defaultYear = "",
  defaultCVV = "",
  maskMiddle = true,
  ring1 = "#ff6be7",
  ring2 = "#7288ff",
  showSubmit = true,
  onChange,
  onSubmit,
  className = "",
  layout = "split"
}: Props) {
  const [number, setNumber] = useState(clampDigits(defaultNumber, 19));
  const [holder, setHolder] = useState(defaultHolder.toUpperCase());
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [cvv, setCVV] = useState(clampDigits(defaultCVV, 4));
  const [focusField, setFocusField] = useState<null | "number" | "holder" | "expire" | "cvv">(null);

  const flip = focusField === "cvv";
  const years = useMemo(() => {
    const start = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => String(start + i));
  }, []);

  const validity: CardValidity = useMemo(() => {
    const numberValid = number.length >= 13;
    const holderValid = holder.trim().length >= 2;
    const monthValid = !!month && +month >= 1 && +month <= 12;
    const yearValid = !!year && +year >= new Date().getFullYear();
    const cvvValid = /^\d{3,4}$/.test(cvv);
    return {
      number: numberValid,
      holder: holderValid,
      month: monthValid,
      year: yearValid,
      cvv: cvvValid,
      allValid: numberValid && holderValid && monthValid && yearValid && cvvValid
    };
  }, [number, holder, month, year, cvv]);

  useEffect(() => {
    onChange?.({ number, holder, month, year, cvv }, validity);
  }, [number, holder, month, year, cvv, validity, onChange]);

  const cardNetwork = useMemo(() => getCardNetwork(number), [number]);
  const previewGroups = useMemo(() => getPreviewGroups(number, maskMiddle), [number, maskMiddle]);

  const highlightClass = (() => {
    switch (focusField) {
      case "number":
        return "highlight__number";
      case "holder":
        return "highlight__holder";
      case "expire":
        return "highlight__expire";
      case "cvv":
        return "highlight__cvv";
      default:
        return "hidden";
    }
  })();

  const ringStyle = {
    "--ring1": ring1,
    "--ring2": ring2
  } as CSSProperties;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit?.({ number, holder, month, year, cvv }, validity);
  }

  function renderCardBrand() {
    if (cardNetwork === "visa") {
      return <VisaMark className="h-10 border-white/15 bg-white text-[#1434cb] shadow-none" />;
    }

    if (cardNetwork === "mastercard") {
      return <MastercardMark className="h-10 border-white/15 bg-white shadow-none" />;
    }

    return <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Debit / Credit</div>;
  }

  return (
    <section className={`ccp ${className}`}>
      <div className={`wrap ${layout === "stacked" ? "wrap--stacked" : ""}`}>
        {layout === "stacked" ? (
          <>
            <form className="form" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="number">Card Number</label>
                <input
                  id="number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  value={formatNumberSpaces(number)}
                  onChange={(e) => setNumber(clampDigits(e.target.value, 19))}
                  onFocus={() => setFocusField("number")}
                  onBlur={() => setFocusField(null)}
                  aria-invalid={!validity.number}
                />
                {!validity.number && number.length >= 13 ? <small className="err">Card number looks invalid</small> : null}
              </div>

              <div>
                <label htmlFor="holder">Card Holder</label>
                <input
                  id="holder"
                  type="text"
                  autoComplete="cc-name"
                  placeholder="JANE DOE"
                  value={holder}
                  onChange={(e) => setHolder(e.target.value.toUpperCase())}
                  onFocus={() => setFocusField("holder")}
                  onBlur={() => setFocusField(null)}
                  aria-invalid={!validity.holder}
                />
              </div>

              <div className="field__group">
                <div>
                  <label>Expiration Date</label>
                  <div className="field__date">
                    <select
                      id="expiration_month"
                      value={month || ""}
                      onChange={(e) => setMonth(e.target.value)}
                      onFocus={() => setFocusField("expire")}
                      onBlur={() => setFocusField(null)}
                      aria-invalid={!validity.month}
                    >
                      <option value="" disabled>
                        Month
                      </option>
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      id="expiration_year"
                      value={year || ""}
                      onChange={(e) => setYear(e.target.value)}
                      onFocus={() => setFocusField("expire")}
                      onBlur={() => setFocusField(null)}
                      aria-invalid={!validity.year}
                    >
                      <option value="" disabled>
                        Year
                      </option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="***"
                    value={cvv}
                    onChange={(e) => setCVV(clampDigits(e.target.value, 4))}
                    onFocus={() => setFocusField("cvv")}
                    onBlur={() => setFocusField(null)}
                    aria-invalid={!validity.cvv}
                  />
                </div>
              </div>

              {showSubmit ? (
                <button className="submit" type="submit" disabled={!validity.allValid} aria-disabled={!validity.allValid}>
                  {validity.allValid ? "Submit" : "Complete all fields"}
                </button>
              ) : null}
            </form>

            <section id="card" className={`card ${flip ? "flip" : ""}`}>
              <div id="highlight" className={highlightClass} />

              <section className="card__front" style={ringStyle}>
                <div className="card__header">
                  <div className="card__header__title">Card details</div>
                  <div className="card__brand">{renderCardBrand()}</div>
                </div>

                <div id="card_number" className="card__number" aria-label="Card number">
                  {previewGroups.map((group, index) => (
                    <span key={index} className={`card__number__group ${group ? "is-filled" : ""}`}>
                      {group || "••••"}
                    </span>
                  ))}
                </div>

                <div className="card__footer">
                  <div className="card__holder">
                    <div className="card__section__title">Card Holder</div>
                    <div id="card_holder">{holder || ""}</div>
                  </div>
                  <div className="card__expires">
                    <div className="card__section__title">Expires</div>
                    <span id="card_expires_month">{month || ""}</span>
                    <span className={`card__expires__divider ${month || year ? "is-visible" : ""}`}>/</span>
                    <span id="card_expires_year">{year ? year.slice(-2) : ""}</span>
                  </div>
                </div>
              </section>

              <section className="card__back" style={ringStyle}>
                <div className="card__hide_line" />
                <div className="card_cvv">
                  <span>CVV</span>
                  <div id="card_cvv_field" className="card_cvv_field">{"*".repeat(cvv.length)}</div>
                </div>
              </section>
            </section>
          </>
        ) : (
          <>
            <section id="card" className={`card ${flip ? "flip" : ""}`}>
              <div id="highlight" className={highlightClass} />

              <section className="card__front" style={ringStyle}>
                <div className="card__header">
                  <div className="card__header__title">Card details</div>
                  <div className="card__brand">{renderCardBrand()}</div>
                </div>

                <div id="card_number" className="card__number" aria-label="Card number">
                  {previewGroups.map((group, index) => (
                    <span key={index} className={`card__number__group ${group ? "is-filled" : ""}`}>
                      {group || "••••"}
                    </span>
                  ))}
                </div>

                <div className="card__footer">
                  <div className="card__holder">
                    <div className="card__section__title">Card Holder</div>
                    <div id="card_holder">{holder || ""}</div>
                  </div>
                  <div className="card__expires">
                    <div className="card__section__title">Expires</div>
                    <span id="card_expires_month">{month || ""}</span>
                    <span className={`card__expires__divider ${month || year ? "is-visible" : ""}`}>/</span>
                    <span id="card_expires_year">{year ? year.slice(-2) : ""}</span>
                  </div>
                </div>
              </section>

              <section className="card__back" style={ringStyle}>
                <div className="card__hide_line" />
                <div className="card_cvv">
                  <span>CVV</span>
                  <div id="card_cvv_field" className="card_cvv_field">{"*".repeat(cvv.length)}</div>
                </div>
              </section>
            </section>

            <form className="form" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="number">Card Number</label>
                <input
                  id="number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  value={formatNumberSpaces(number)}
                  onChange={(e) => setNumber(clampDigits(e.target.value, 19))}
                  onFocus={() => setFocusField("number")}
                  onBlur={() => setFocusField(null)}
                  aria-invalid={!validity.number}
                />
                {!validity.number && number.length >= 13 ? <small className="err">Card number looks invalid</small> : null}
              </div>

              <div>
                <label htmlFor="holder">Card Holder</label>
                <input
                  id="holder"
                  type="text"
                  autoComplete="cc-name"
                  placeholder="JANE DOE"
                  value={holder}
                  onChange={(e) => setHolder(e.target.value.toUpperCase())}
                  onFocus={() => setFocusField("holder")}
                  onBlur={() => setFocusField(null)}
                  aria-invalid={!validity.holder}
                />
              </div>

              <div className="field__group">
                <div>
                  <label>Expiration Date</label>
                  <div className="field__date">
                    <select
                      id="expiration_month"
                      value={month || ""}
                      onChange={(e) => setMonth(e.target.value)}
                      onFocus={() => setFocusField("expire")}
                      onBlur={() => setFocusField(null)}
                      aria-invalid={!validity.month}
                    >
                      <option value="" disabled>
                        Month
                      </option>
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      id="expiration_year"
                      value={year || ""}
                      onChange={(e) => setYear(e.target.value)}
                      onFocus={() => setFocusField("expire")}
                      onBlur={() => setFocusField(null)}
                      aria-invalid={!validity.year}
                    >
                      <option value="" disabled>
                        Year
                      </option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="***"
                    value={cvv}
                    onChange={(e) => setCVV(clampDigits(e.target.value, 4))}
                    onFocus={() => setFocusField("cvv")}
                    onBlur={() => setFocusField(null)}
                    aria-invalid={!validity.cvv}
                  />
                </div>
              </div>

              {showSubmit ? (
                <button className="submit" type="submit" disabled={!validity.allValid} aria-disabled={!validity.allValid}>
                  {validity.allValid ? "Submit" : "Complete all fields"}
                </button>
              ) : null}
            </form>
          </>
        )}
      </div>

      <style jsx>{`
        .ccp {
          width: 100%;
          display: flex;
          justify-content: center;
          color: #0d0c22;
        }

        .wrap {
          width: 100%;
          max-width: 1000px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .wrap--stacked {
          max-width: 100%;
          grid-template-columns: 1fr;
        }

        .wrap--stacked .card {
          max-width: 100%;
          order: 2;
        }

        .wrap--stacked .form {
          order: 1;
        }

        .wrap--stacked .card__front,
        .wrap--stacked .card__back,
        .wrap--stacked .form {
          max-width: 100%;
        }

        @media (max-width: 920px) {
          .wrap {
            grid-template-columns: 1fr;
          }
        }

        * {
          box-sizing: border-box;
        }

        #highlight {
          position: absolute;
          border: 1px solid rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          z-index: 1;
          width: 0;
          height: 0;
          top: 0;
          left: 0;
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
          transition: 0.3s;
        }

        #highlight.highlight__number {
          width: 346px;
          height: 40px;
          top: 92px;
          left: 18px;
        }

        #highlight.highlight__holder {
          width: 264px;
          height: 56px;
          top: 156px;
          left: 18px;
        }

        #highlight.highlight__expire {
          width: 86px;
          height: 56px;
          top: 156px;
          left: 323px;
        }

        #highlight.highlight__cvv {
          width: 381px;
          height: 91px;
          top: 83px;
          left: 18px;
        }

        #highlight.hidden {
          display: none;
        }

        .card {
          position: relative;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          transform-style: preserve-3d;
          transition: 0.8s;
          perspective: 1000px;
        }

        .card.flip {
          transform: rotateY(180deg);
        }

        .card__front,
        .card__back {
          width: 100%;
          max-width: 420px;
          height: 233px;
          border-radius: 20px;
          padding: 24px 30px 30px;
          background: linear-gradient(to right bottom, #323941, #061018);
          box-shadow: 0 33px 50px -15px rgba(50, 55, 63, 0.66);
          color: #fff;
          overflow: hidden;
          margin: 0 auto;
          backface-visibility: hidden;
          position: relative;
        }

        @media (max-width: 450px) {
          .card__front,
          .card__back {
            padding: 12px 14px 16px;
            height: 206px;
          }

          #highlight.highlight__number {
            width: 300px;
            left: 14px;
          }

          #highlight.highlight__holder {
            width: 220px;
            left: 14px;
          }

          #highlight.highlight__expire {
            left: 280px;
          }

          #highlight.highlight__cvv {
            width: 330px;
            left: 14px;
          }
        }

        .card__back {
          position: absolute;
          top: 0;
          left: 0;
          transform: rotateY(180deg);
          padding: 24px 0 0;
        }

        .card__front::before,
        .card__back::before {
          content: "";
          position: absolute;
          border: 16px solid var(--ring1);
          border-radius: 100%;
          left: -17%;
          top: -45px;
          height: 300px;
          width: 300px;
          filter: blur(13px);
        }

        .card__front::after,
        .card__back::after {
          content: "";
          position: absolute;
          border: 16px solid var(--ring2);
          border-radius: 100%;
          width: 300px;
          top: 55%;
          left: -200px;
          height: 300px;
          filter: blur(13px);
        }

        .card__hide_line {
          height: 40px;
          width: 100%;
          background-color: #6b7280;
          position: relative;
          z-index: 1;
        }

        .card__header__title {
          font-size: 13px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.74);
        }

        .card__brand {
          display: flex;
          align-items: center;
        }

        .card_cvv {
          position: relative;
          z-index: 1;
          margin-top: 24px;
          padding: 0 32px;
          display: flex;
          flex-direction: column;
          align-items: end;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .card_cvv_field {
          margin-top: 6px;
          background-color: #fff;
          border-radius: 12px;
          height: 44px;
          width: 100%;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: end;
          padding: 0 12px;
          font-size: 25px;
          line-height: 21px;
        }

        .card__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 600;
          margin-bottom: 32px;
          position: relative;
          z-index: 1;
        }

        .card__number {
          font-size: 22px;
          margin-bottom: 32px;
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          min-height: 33px;
          color: #fff;
          letter-spacing: 0.08em;
        }

        .card__number__group {
          display: inline-flex;
          min-width: 52px;
          justify-content: center;
          color: rgba(255, 255, 255, 0.34);
        }

        .card__number__group.is-filled {
          color: #fff;
        }

        #card_holder:empty::after,
        #card_expires_month:empty::after,
        #card_expires_year:empty::after {
          content: "";
          display: inline-block;
          width: 0.55em;
          height: 1.1em;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.12);
        }

        .card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .card__holder {
          text-transform: uppercase;
          min-height: 42px;
        }

        #card_holder,
        .card__expires {
          margin-top: 4px;
          min-height: 24px;
        }

        .card__expires {
          min-width: 72px;
          text-align: right;
        }

        .card__expires__divider {
          opacity: 0;
          padding: 0 2px;
          transition: opacity 0.2s ease;
        }

        .card__expires__divider.is-visible {
          opacity: 0.55;
        }

        .card__section__title {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .form {
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.92);
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 24px;
          border: 1px solid rgba(226, 232, 240, 0.95);
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
          display: grid;
          gap: 12px;
          color: #0d0c22;
          backdrop-filter: blur(12px);
        }

        .wrap--stacked .form {
          width: 100%;
          max-width: 100%;
          margin-top: 4px;
        }

        label {
          display: block;
          margin: 6px 0 4px;
          color: #0d0c22;
          font-weight: 500;
        }

        input,
        select {
          height: 52px;
          display: block;
          width: 100%;
          border: 1px solid #cbd5e1;
          padding: 18px 20px;
          transition: outline 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
          border-radius: 12px;
          outline: none;
          background-color: #fff;
          color: #0d0c22;
          font-size: 16px;
        }

        input:focus,
        select:focus {
          border: 1px solid #0f172a;
          outline: 4px solid rgba(99, 102, 241, 0.12);
        }

        select {
          padding: 0 20px;
        }

        .field__group {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        @media (max-width: 560px) {
          .field__group {
            grid-template-columns: 1fr;
          }
        }

        .field__date {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .err {
          color: #b42318;
          font-size: 12px;
          margin-top: 4px;
        }

        .submit {
          margin-top: 8px;
          height: 48px;
          border: none;
          border-radius: 10px;
          background: #0d0c22;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          opacity: ${validity.allValid ? 1 : 0.6};
        }
      `}</style>
    </section>
  );
}

export type { CardState, CardValidity };
