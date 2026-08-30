import { useEffect, type ReactNode } from 'react';
import type { Settings } from '../../types';
import { HOLD_OPTIONS, TRANSITION_OPTIONS } from './storage';

interface SettingsSheetProps {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-medium uppercase tracking-[0.25em] text-fg-muted">{title}</h3>
      {children}
    </section>
  );
}

function OptionGrid<T extends number>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onSelect: (option: T) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onSelect(option)}
          className={`min-h-11 rounded-full border text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            value === option
              ? 'border-accent text-accent'
              : 'border-line text-fg-secondary hover:border-fg-muted'
          }`}
        >
          {option}s
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <div>
        <p className="text-sm text-fg">{label}</p>
        {description && <p className="text-xs text-fg-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          checked ? 'border-accent bg-accent' : 'border-line bg-surface'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-1 h-[18px] w-[18px] rounded-full transition-all ${
            checked ? 'left-6 bg-black' : 'left-1 bg-fg-muted'
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsSheet({ settings, onUpdate, onClose }: SettingsSheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Close settings" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="no-scrollbar relative max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border-t border-line bg-surface px-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-5"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="settings-title" className="text-sm font-semibold uppercase tracking-[0.3em] text-fg">
            Settings
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-fg-muted transition hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-8">
          <Section title="Hold duration">
            <OptionGrid
              label="Hold duration"
              options={HOLD_OPTIONS}
              value={settings.holdSeconds}
              onSelect={(holdSeconds) => onUpdate({ holdSeconds })}
            />
          </Section>

          <Section title="Transition time">
            <OptionGrid
              label="Transition time"
              options={TRANSITION_OPTIONS}
              value={settings.transitionSeconds}
              onSelect={(transitionSeconds) => onUpdate({ transitionSeconds })}
            />
          </Section>

          <Section title="Feedback">
            <Toggle
              label="Vibration"
              checked={settings.vibrationEnabled}
              onChange={(v) => onUpdate({ vibrationEnabled: v })}
            />
            <Toggle
              label="Sound"
              checked={settings.soundEnabled}
              onChange={(v) => onUpdate({ soundEnabled: v })}
            />
          </Section>

          <Section title="Display">
            <Toggle
              label="Keep screen awake"
              description="While a session is active"
              checked={settings.keepAwakeEnabled}
              onChange={(v) => onUpdate({ keepAwakeEnabled: v })}
            />
          </Section>

          <Section title="Privacy">
            <p className="text-xs leading-relaxed text-fg-muted">
              All data stays on your device. No accounts, no analytics, no tracking, no external
              requests.
            </p>
          </Section>

          <Section title="About">
            <p className="text-xs leading-relaxed text-fg-muted">
              STILLSTANCE v{__APP_VERSION__} — Time in position. Free and open source, licensed
              under AGPL-3.0.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
