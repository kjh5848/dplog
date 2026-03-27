import type { ReactNode } from "react";

const steps = ["매장 정보", "키워드", "요약", "제출"];

type DiagnosisShellProps = {
  title: string;
  subtitle?: string;
  stepIndex?: number;
  children: ReactNode;
};

export default function DiagnosisShell({
  title,
  subtitle,
  stepIndex = 0,
  children,
}: DiagnosisShellProps) {
  return (
    <div className="page">
      <header className="nav">
        <div className="container nav-inner">
          <div className="brand">D-PLOG</div>
          <div className="nav-actions">
            <button className="btn btn-ghost">도움말</button>
            <button className="btn btn-secondary">로그인</button>
          </div>
        </div>
      </header>

      <main className="section">
        <div className="container stack gap-xl">
          <div className="section-head">
            <span className="eyebrow">진단 위저드</span>
            <h2>{title}</h2>
            {subtitle ? <p className="muted">{subtitle}</p> : null}
          </div>

          <div className="stepper">
            {steps.map((label, index) => {
              const state = index === stepIndex ? "active" : index < stepIndex ? "done" : "idle";
              return (
                <div key={label} className={`step ${state}`}>
                  <div className="step-circle">{index + 1}</div>
                  <div className="step-label">{label}</div>
                </div>
              );
            })}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
