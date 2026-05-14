import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, ReferenceLine } from "recharts";

const WORKER_URL = "https://sheets-proxy-iota.vercel.app/api/proxy";

// ── Rep roster ────────────────────────────────────────────────────────────────
const REPS = [
  { name: "Ahjei Holieway",   short: "AH", tz: "PST" },
  { name: "Brandon Hardy",    short: "BH", tz: "PST" },
  { name: "Aram Antranigian", short: "AA", tz: "EST" },
  { name: "Graydon Brown",    short: "GB", tz: "PST" },
  { name: "Chris Sims",       short: "CS", tz: "CST" },
  { name: "Henry Moffly",     short: "HM", tz: "PST" },
];

// ── Monthly data ──────────────────────────────────────────────────────────────
const MONTHS = {
  feb: {
    label: "February", short: "Feb", quarter: "Q1", teamTarget: 31400, adjustments: -300, complete: true,
    reps: [
      { name: "Ahjei Holieway",   quota: 8900, closed: 10673, low: 8553,  high: 11380, forecast: 9967  },
      { name: "Brandon Hardy",    quota: 8900, closed: 12332, low: 12792, high: 13500, forecast: 8256  },
      { name: "Aram Antranigian", quota: 6800, closed: 7927,  low: 7290,  high: 9000,  forecast: 8145  },
      { name: "Graydon Brown",    quota: 6800, closed: 13604, low: 9634,  high: 10319, forecast: 9977  },
      { name: "Chris Sims",       quota: 3400, closed: 0,     low: 0,     high: 0,     forecast: 0     },
      { name: "Henry Moffly",     quota: 0,    closed: 0,     low: 0,     high: 0,     forecast: 0     },
    ],
  },
  mar: {
    label: "March", short: "Mar", quarter: "Q1", teamTarget: 34800, adjustments: -300, complete: true,
    reps: [
      { name: "Ahjei Holieway",   quota: 8900, closed: 8920,  low: 7448,  high: 12700, forecast: 10074 },
      { name: "Brandon Hardy",    quota: 8900, closed: 10631, low: 7911,  high: 11499, forecast: 9705  },
      { name: "Aram Antranigian", quota: 6800, closed: 5665,  low: 7000,  high: 8000,  forecast: 7500  },
      { name: "Graydon Brown",    quota: 6800, closed: 12278, low: 11678, high: 14958, forecast: 13318 },
      { name: "Chris Sims",       quota: 6800, closed: 4353,  low: 4328,  high: 7554,  forecast: 5941  },
      { name: "Henry Moffly",     quota: 0,    closed: 0,     low: 0,     high: 0,     forecast: 0     },
    ],
  },
  apr: {
    label: "April", short: "Apr", quarter: "Q1", teamTarget: 38200, adjustments: -300, complete: true,
    reps: [
      { name: "Ahjei Holieway",   quota: 8900, closed: 10364, low: 9104,  high: 7000,  forecast: 8052  },
      { name: "Brandon Hardy",    quota: 8900, closed: 11191, low: 8351,  high: 9387,  forecast: 11380 },
      { name: "Aram Antranigian", quota: 6800, closed: 9857,  low: 8200,  high: 10000, forecast: 9100  },
      { name: "Graydon Brown",    quota: 6800, closed: 9456,  low: 7178,  high: 9200,  forecast: 8189  },
      { name: "Chris Sims",       quota: 6800, closed: 1369,  low: 1369,  high: 4509,  forecast: 2939  },
      { name: "Henry Moffly",     quota: 0,    closed: 0,     low: 0,     high: 0,     forecast: 0     },
    ],
  },
  may: {
    label: "May", short: "May", quarter: "Q2", teamTarget: 38200, adjustments: -300, complete: false,
    businessDays: 22, daysLeft: 12, elapsed: 10, pacingPct: 45.45,
    convex: { total: 5213, closerShare: 2606.50 },
    miscAdjustments: [
      { account: "Pettigrew Plumbing and HVAC",               pam: "Aram Antranigian", cmrr: 35,  note: "Not in SF" },
      { account: "Dan Levinsky",                              pam: "Aram Antranigian", cmrr: 35,  note: "Not in SF" },
      { account: "Stoudenmire Heating and Air Conditioning",  pam: "Aram Antranigian", cmrr: 300, note: "Not in SF" },
      { account: "James River",                               pam: "Brando Calrisian", cmrr: 35,  note: "Not in SF" },
    ],
    // eowWeeks: ordered newest-first so active week detection picks the latest with data
    eowWeeks: [
      { label: "EOW 2", goalPct: 37, commits: { "Ahjei Holieway": 3564, "Brandon Hardy": 1884, "Aram Antranigian": 370,  "Graydon Brown": 3703, "Chris Sims": 5972, "Henry Moffly": 0 }, goals: { "Ahjei Holieway": 3293, "Brandon Hardy": 3293, "Aram Antranigian": 2516, "Graydon Brown": 2516, "Chris Sims": 2516, "Henry Moffly": 0 } },
      { label: "EOW 1", goalPct: 14, commits: { "Ahjei Holieway": 3424, "Brandon Hardy": 440,  "Aram Antranigian": 1685, "Graydon Brown": 3646, "Chris Sims": 1223, "Henry Moffly": 0 }, goals: { "Ahjei Holieway": 1246, "Brandon Hardy": 1246, "Aram Antranigian": 952,  "Graydon Brown": 952,  "Chris Sims": 952,  "Henry Moffly": 0 } },
    ],
    reps: [
      { name: "Ahjei Holieway",   quota: 8900, closed: 3564, low: 3564, high: 5094, forecast: 4329 },
      { name: "Brandon Hardy",    quota: 8900, closed: 1919, low: 1919, high: 1884, forecast: 1902 },
      { name: "Aram Antranigian", quota: 6800, closed: 1910, low: 1910, high: 1995, forecast: 1953 },
      { name: "Graydon Brown",    quota: 6800, closed: 3228, low: 3228, high: 3703, forecast: 3466 },
      { name: "Chris Sims",       quota: 6800, closed: 4618, low: 4618, high: 7247, forecast: 5933 },
      { name: "Henry Moffly",     quota: 0,    closed: 0,    low: 0,    high: 0,    forecast: 0    },
    ],
  },
};

// ── Quarter definitions ───────────────────────────────────────────────────────
const QUARTERS = {
  Q1: {
    label: "Q1 FY2026", months: ["feb","mar","apr"], teamTarget: 104400,
    repTargets: { "Ahjei Holieway": 26700, "Brandon Hardy": 26700, "Aram Antranigian": 20400, "Graydon Brown": 20400, "Chris Sims": 20400, "Henry Moffly": 0 },
  },
  Q2: {
    label: "Q2 FY2026", months: ["may","jun","jul"], teamTarget: 124800,
    repTargets: { "Ahjei Holieway": 26700, "Brandon Hardy": 26700, "Aram Antranigian": 20400, "Graydon Brown": 20400, "Chris Sims": 20400, "Henry Moffly": 10200 },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => n == null ? "—" : "$" + Math.round(n).toLocaleString();
const pct = (n) => n == null || isNaN(n) || !isFinite(n) ? "—" : n.toFixed(1) + "%";
const attColor = (p) => {
  if (p >= 100) return "#00e5a0";
  if (p >= 75)  return "#f9c74f";
  if (p >= 50)  return "#f4845f";
  return "#ef4444";
};
const tzColor = { PST: "#60a5fa", EST: "#a78bfa", CST: "#34d399" };

function enrichMonth(md) {
  const reps = md.reps.map(r => ({
    ...r,
    attainPct:   r.quota ? (r.closed   / r.quota * 100) : 0,
    forecastAtt: r.quota ? (r.forecast / r.quota * 100) : 0,
    delta: r.quota - r.closed,
    tz:    REPS.find(x => x.name === r.name)?.tz    || "PST",
    short: REPS.find(x => x.name === r.name)?.short || "?",
  }));
  // teamClosed = gross rep sum only (adjustments tracked separately, not deducted from MTD)
  const teamClosed = reps.reduce((s,r)=>s+r.closed, 0);

  // For active months: forecast = sum of active EOW commits (most recent week with data)
  // For completed months: forecast = sum of individual rep forecast fields
  let teamForecast;
  if (!md.complete && md.eowWeeks?.length) {
    const activeWeek = md.eowWeeks.find(w => Object.values(w.commits).some(v => v > 0));
    teamForecast = activeWeek
      ? Object.values(activeWeek.commits).reduce((s,v)=>s+(v||0), 0)
      : reps.reduce((s,r)=>s+r.forecast, 0);
  } else {
    teamForecast = reps.reduce((s,r)=>s+r.forecast, 0);
  }

  const teamAttain   = md.teamTarget ? (teamClosed / md.teamTarget * 100) : 0;
  return { ...md, reps, teamClosed, teamForecast, teamAttain };
}

// ── Shared UI pieces ──────────────────────────────────────────────────────────
// ── Active EOW pacing logic ──────────────────────────────────────────────────
// Finds the most recent EOW week where at least one rep has a commit value.
// Returns { label, goalPct, teamCommit, teamGoal, pacingPct, repBreakdown }
function getActiveEOW(monthData) {
  const weeks = monthData?.eowWeeks;
  if (!weeks?.length) return null;

  // Walk newest-first, stop at first week with any commit data
  for (const week of weeks) {
    const repNames = Object.keys(week.commits);
    const hasData  = repNames.some(n => (week.commits[n] || 0) > 0);
    if (!hasData) continue;

    const teamCommit = repNames.reduce((s, n) => s + (week.commits[n] || 0), 0);
    const teamGoal   = repNames.reduce((s, n) => s + (week.goals[n]   || 0), 0);
    const pacingPct  = teamGoal ? (teamCommit / teamGoal * 100) : 0;

    const repBreakdown = monthData.reps
      .filter(r => r.quota > 0)
      .map(r => ({
        name:    r.name,
        short:   REPS.find(x => x.name === r.name)?.short || "?",
        commit:  week.commits[r.name] || 0,
        goal:    week.goals[r.name]   || 0,
        pct:     week.goals[r.name] ? ((week.commits[r.name]||0) / week.goals[r.name] * 100) : 0,
        closed:  r.closed,
        quota:   r.quota,
      }));

    return { label: week.label, goalPct: week.goalPct, teamCommit, teamGoal, pacingPct, repBreakdown };
  }
  return null;
}

function StatBox({ label, value, color="#f1f5f9", sub }) {
  return (
    <div style={{ background: "#0a1628", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 16px", minWidth: 0 }}>
      <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function RepRow({ rep, pacing, showEOW }) {
  const [expanded, setExpanded] = useState(false);
  if (rep.quota === 0) return null;
  const color = attColor(rep.attainPct);
  const isAbove = rep.attainPct >= (pacing || 45.45);
  return (
    <div onClick={() => setExpanded(!expanded)} style={{
      background: "linear-gradient(135deg, #0a1628, #111f35)",
      border: `1px solid ${color}22`, borderLeft: `3px solid ${color}`,
      borderRadius: 10, padding: "14px 18px", cursor: "pointer",
      transition: "all 0.2s", position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8, flexShrink: 0,
          background: `linear-gradient(135deg, ${color}15, ${color}30)`,
          border: `1px solid ${color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 12, color,
        }}>{rep.short}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "#f1f5f9" }}>{rep.name}</span>
            <span style={{ fontSize: 10, color: tzColor[rep.tz]||"#64748b", flexShrink: 0 }}>{rep.tz}</span>
          </div>
          <div style={{ margin: "6px 0 3px", height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(rep.attainPct,100)}%`, background: `linear-gradient(90deg, ${color}70, ${color})`, borderRadius: 2 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color }}>{pct(rep.attainPct)} attain</span>
            <span style={{ fontSize: 11, color: "#475569" }}>{fmt(rep.closed)} / {fmt(rep.quota)}</span>
          </div>
        </div>
      </div>
      <div style={{
        position: "absolute", top: 10, right: 12,
        background: isAbove ? "#00e5a010" : "#ef444410",
        border: `1px solid ${isAbove ? "#00e5a040" : "#ef444440"}`,
        borderRadius: 5, padding: "2px 6px", fontSize: 9,
        color: isAbove ? "#00e5a0" : "#ef4444",
      }}>{isAbove ? "▲" : "▼"} PACE</div>
      {expanded && (
        <div style={{ marginTop: 14, borderTop: "1px solid #1e293b", paddingTop: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            ["LOW", fmt(rep.low)], ["HIGH", fmt(rep.high)],
            ["FORECAST", fmt(rep.forecast)], ["F.ATTAIN", pct(rep.forecastAtt)],
            ...(showEOW ? [["EOW2 CMT", fmt(rep.eow2Commit)], ["EOW2 GOAL", fmt(rep.eow2Goal)]] : []),
            ["DELTA", fmt(rep.delta)],
          ].map(([l,v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 8, color: "#475569", letterSpacing: 1, textTransform: "uppercase" }}>{l}</div>
              <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Month view ────────────────────────────────────────────────────────────────
function MonthView({ monthKey, monthOverride }) {
  const raw = monthOverride || MONTHS[monthKey];
  if (!raw) return (
    <div style={{ textAlign: "center", padding: 60, color: "#334155" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
      <div style={{ fontSize: 14, color: "#475569" }}>No data yet for this month.</div>
    </div>
  );
  const m = enrichMonth(raw);
  const barData = m.reps.filter(r=>r.quota>0).map(r=>({ name: r.short, attain: r.attainPct }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <StatBox label="Team Closed" value={fmt(m.teamClosed)} color="#00e5a0" sub={`${pct(m.teamAttain)} of target`} />
        <StatBox label="100% Target" value={fmt(m.teamTarget)} />
        <StatBox label="Forecast" value={fmt(m.teamForecast)} color="#60a5fa" sub={pct(m.teamTarget ? m.teamForecast/m.teamTarget*100 : 0)} />
        <StatBox label="Low Proj" value={fmt(m.reps.reduce((s,r)=>s+r.low,0))} color="#f4845f" />
        <StatBox label="High Proj" value={fmt(m.reps.reduce((s,r)=>s+r.high,0))} color="#a78bfa" />
        {!m.complete && (() => {
          const eow = getActiveEOW(m);
          if (!eow) return null;
          const col = attColor(eow.pacingPct);
          return <StatBox label={`${eow.label} Pacing`} value={pct(eow.pacingPct)} color={col} sub={`${fmt(eow.teamCommit)} cmt · ${fmt(eow.teamGoal)} goal`} />;
        })()}
        {m.convex && <StatBox label="Convex (50%)" value={fmt(m.convex.closerShare)} color="#34d399" sub={`Total: ${fmt(m.convex.total)}`} />}
      </div>

      {/* Bar chart */}
      <div style={{ background: "linear-gradient(135deg, #0a1628, #111f35)", border: "1px solid #1e293b", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 14 }}>REP ATTAINMENT vs 100% QUOTA {m.complete ? "— FINAL" : "— MTD"}</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={barData} barSize={32}>
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v=>v+"%"} />
            <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} formatter={v=>[pct(v), "Attainment"]} />
            {!m.complete && (() => { const eow = getActiveEOW(m); return eow ? <ReferenceLine y={eow.goalPct} stroke="#f9c74f" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: eow.label, fill: "#f9c74f", fontSize: 9, position: "insideTopRight" }} /> : null; })()}
            <ReferenceLine y={100} stroke="#00e5a030" strokeDasharray="2 4" strokeWidth={1} />
            <Bar dataKey="attain" radius={[5,5,0,0]}>
              {barData.map((e,i)=><Cell key={i} fill={attColor(e.attain)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {!m.complete && (() => { const eow = getActiveEOW(m); return eow ? <div style={{ fontSize: 10, color: "#f9c74f", textAlign: "right", marginTop: 4 }}>── {eow.label} goal: {pct(eow.goalPct)} of quota · team commit {pct(eow.pacingPct)} of goal</div> : null; })()}
      </div>

      {/* Rep cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 10, color: "#334155", letterSpacing: 1 }}>TAP TO EXPAND · {m.complete ? "FINAL NUMBERS" : "LIVE MTD"}</div>
        {m.reps.map(rep => <RepRow key={rep.name} rep={rep} pacing={m.pacingPct} showEOW={!m.complete && !!rep.eow2Commit} />)}
      </div>

      {/* EOW Pacing Panel */}
      {!m.complete && (() => {
        const eow = getActiveEOW(m);
        if (!eow) return null;
        const col = attColor(eow.pacingPct);
        return (
          <div style={{ background: "linear-gradient(135deg, #0a1628, #111f35)", border: `1px solid ${col}30`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 4 }}>{eow.label.toUpperCase()} PACING — ACTIVE WEEK</div>
                <div style={{ fontSize: 11, color: "#334155" }}>Most recent EOW week with commit data</div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>TEAM COMMIT</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: col }}>{fmt(eow.teamCommit)}</div>
                </div>
                <div style={{ color: "#1e293b", fontSize: 20 }}>/</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>{eow.label.toUpperCase()} GOAL ({eow.goalPct}%)</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>{fmt(eow.teamGoal)}</div>
                </div>
                <div style={{ background: `${col}15`, border: `1px solid ${col}40`, borderRadius: 8, padding: "6px 14px", textAlign: "center", minWidth: 70 }}>
                  <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>PACING</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: col }}>{pct(eow.pacingPct)}</div>
                </div>
              </div>
            </div>
            {/* Team progress bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ height: 8, background: "#1e293b", borderRadius: 4, overflow: "hidden", marginBottom: 4 }}>
                <div style={{ height: "100%", width: `${Math.min(eow.pacingPct, 100)}%`, background: `linear-gradient(90deg, ${col}70, ${col})`, borderRadius: 4, boxShadow: `0 0 8px ${col}60`, transition: "width 0.6s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#334155" }}>
                <span>$0</span><span>{fmt(eow.teamGoal)} goal</span>
              </div>
            </div>
            {/* Per-rep breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              {eow.repBreakdown.map(rep => {
                const rc = attColor(rep.pct);
                return (
                  <div key={rep.name} style={{ background: "#070d1a", border: `1px solid ${rc}20`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: "#e2e8f0", fontWeight: 600 }}>{rep.short}</span>
                      <span style={{ fontSize: 11, color: rc, fontWeight: 700 }}>{pct(rep.pct)}</span>
                    </div>
                    <div style={{ height: 3, background: "#1e293b", borderRadius: 2, marginBottom: 6 }}>
                      <div style={{ height: "100%", width: `${Math.min(rep.pct, 100)}%`, background: rc, borderRadius: 2 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#475569" }}>
                      <span>CMT {fmt(rep.commit)}</span>
                      <span>GOAL {fmt(rep.goal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Misc adjustments */}
      {m.miscAdjustments?.length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #0a1628, #111f35)", border: "1px solid #1e293b", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 12 }}>MISC ADJUSTMENTS — NOT IN SF</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                {["Account","PAM","CMRR","Note"].map(h=>(
                  <th key={h} style={{ textAlign: "left", padding: "5px 10px", color: "#475569", fontSize: 9, letterSpacing: 1, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.miscAdjustments.map((row,i)=>(
                <tr key={i} style={{ borderBottom: "1px solid #0a1628" }}>
                  <td style={{ padding: "7px 10px", color: "#e2e8f0" }}>{row.account}</td>
                  <td style={{ padding: "7px 10px", color: "#94a3b8" }}>{row.pam}</td>
                  <td style={{ padding: "7px 10px", color: "#00e5a0" }}>{fmt(row.cmrr)}</td>
                  <td style={{ padding: "7px 10px", color: "#475569", fontSize: 10 }}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Quarter rollup ────────────────────────────────────────────────────────────
function QuarterView({ quarterKey }) {
  const q = QUARTERS[quarterKey];
  if (!q) return null;

  const repTotals = REPS.map(rep => {
    const closed = q.months.reduce((s,mk) => s + (MONTHS[mk]?.reps.find(r=>r.name===rep.name)?.closed||0), 0);
    const target = q.repTargets[rep.name] || 0;
    return { ...rep, closed, target, attainPct: target ? (closed/target*100) : 0 };
  }).filter(r => r.target > 0 || r.closed > 0);

  const teamClosed = repTotals.reduce((s,r)=>s+r.closed, 0);
  const teamAttain = q.teamTarget ? (teamClosed/q.teamTarget*100) : 0;

  const monthlyBar = q.months.map(mk => {
    const m = MONTHS[mk];
    if (!m) return { month: mk.charAt(0).toUpperCase()+mk.slice(1), actual: null, target: null };
    const closed = m.reps.reduce((s,r)=>s+(r.closed||0),0);
    return { month: m.short, actual: closed || null, target: m.teamTarget };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <StatBox label="Quarter Target" value={fmt(q.teamTarget)} />
        <StatBox label="Closed to Date" value={fmt(teamClosed)} color="#00e5a0" sub={`${pct(teamAttain)} attainment`} />
        {q.months.map(mk => {
          const m = MONTHS[mk];
          if (!m) return <StatBox key={mk} label={mk.toUpperCase()} value="—" color="#334155" sub="No data" />;
          const closed = m.reps.reduce((s,r)=>s+(r.closed||0),0) + (m.adjustments||0);
          const att = m.teamTarget ? closed/m.teamTarget*100 : 0;
          return <StatBox key={mk} label={m.short} value={fmt(closed)} color={attColor(att)} sub={`${pct(att)} · ${m.complete?"FINAL":"MTD"}`} />;
        })}
      </div>

      {/* Monthly bar chart */}
      <div style={{ background: "linear-gradient(135deg, #0a1628, #111f35)", border: "1px solid #1e293b", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 14 }}>MONTHLY PERFORMANCE — {q.label}</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyBar} barCategoryGap="30%">
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v=>"$"+(v/1000).toFixed(0)+"k"} />
            <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} formatter={(v,n)=>[fmt(v), n==="actual"?"Closed":"Target"]} />
            <Bar dataKey="target" fill="#1e293b" radius={[4,4,0,0]} name="target" />
            <Bar dataKey="actual" radius={[4,4,0,0]} name="actual">
              {monthlyBar.map((e,i)=><Cell key={i} fill={e.actual&&e.target ? attColor(e.actual/e.target*100) : "#334155"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rep progress bars toward quarter target */}
      <div style={{ background: "linear-gradient(135deg, #0a1628, #111f35)", border: "1px solid #1e293b", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 16 }}>REP PROGRESS TO {quarterKey} TARGET</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {repTotals.map(rep => {
            const col = attColor(rep.attainPct);
            return (
              <div key={rep.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "#e2e8f0" }}>{rep.name}</span>
                  <span style={{ color: "#64748b" }}>{fmt(rep.closed)} / {fmt(rep.target)} <span style={{ color: col, marginLeft: 6 }}>{pct(rep.attainPct)}</span></span>
                </div>
                <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(rep.attainPct,100)}%`, background: `linear-gradient(90deg, ${col}70, ${col})`, borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Month-by-month table */}
      <div style={{ background: "linear-gradient(135deg, #0a1628, #111f35)", border: "1px solid #1e293b", borderRadius: 14, padding: 20, overflowX: "auto" }}>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 14 }}>MONTH-BY-MONTH BREAKDOWN</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 500 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b" }}>
              <th style={{ textAlign: "left", padding: "6px 12px", color: "#475569", fontSize: 9, letterSpacing: 1, fontWeight: 500 }}>REP</th>
              {q.months.map(mk=><th key={mk} style={{ textAlign: "right", padding: "6px 12px", color: "#475569", fontSize: 9, letterSpacing: 1, fontWeight: 500 }}>{MONTHS[mk]?.short||mk.toUpperCase()}</th>)}
              <th style={{ textAlign: "right", padding: "6px 12px", color: "#475569", fontSize: 9, letterSpacing: 1, fontWeight: 500 }}>TOTAL</th>
              <th style={{ textAlign: "right", padding: "6px 12px", color: "#475569", fontSize: 9, letterSpacing: 1, fontWeight: 500 }}>QTR TARGET</th>
              <th style={{ textAlign: "right", padding: "6px 12px", color: "#475569", fontSize: 9, letterSpacing: 1, fontWeight: 500 }}>ATTAIN</th>
            </tr>
          </thead>
          <tbody>
            {repTotals.map(rep => {
              const col = attColor(rep.attainPct);
              return (
                <tr key={rep.name} style={{ borderBottom: "1px solid #0a1628" }}>
                  <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{rep.short} <span style={{ color: "#e2e8f0" }}>{rep.name}</span></td>
                  {q.months.map(mk=>{
                    const r = MONTHS[mk]?.reps.find(r=>r.name===rep.name);
                    return <td key={mk} style={{ padding: "8px 12px", color: "#64748b", textAlign: "right" }}>{fmt(r?.closed||0)}</td>;
                  })}
                  <td style={{ padding: "8px 12px", color: col, textAlign: "right", fontWeight: 600 }}>{fmt(rep.closed)}</td>
                  <td style={{ padding: "8px 12px", color: "#475569", textAlign: "right" }}>{fmt(rep.target)}</td>
                  <td style={{ padding: "8px 12px", color: col, textAlign: "right", fontWeight: 700 }}>{pct(rep.attainPct)}</td>
                </tr>
              );
            })}
            {/* Team total row */}
            <tr style={{ borderTop: "1px solid #1e293b" }}>
              <td style={{ padding: "8px 12px", color: "#475569", fontSize: 10 }}>TEAM</td>
              {q.months.map(mk=>{
                const m = MONTHS[mk];
                const total = m ? m.reps.reduce((s,r)=>s+(r.closed||0),0) : 0;
                return <td key={mk} style={{ padding: "8px 12px", color: "#94a3b8", textAlign: "right" }}>{fmt(total)}</td>;
              })}
              <td style={{ padding: "8px 12px", color: attColor(teamAttain), textAlign: "right", fontWeight: 700 }}>{fmt(teamClosed)}</td>
              <td style={{ padding: "8px 12px", color: "#475569", textAlign: "right" }}>{fmt(q.teamTarget)}</td>
              <td style={{ padding: "8px 12px", color: attColor(teamAttain), textAlign: "right", fontWeight: 700 }}>{pct(teamAttain)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── YTD summary ───────────────────────────────────────────────────────────────
function SummaryView() {
  const completedMonths = Object.entries(MONTHS).map(([key, md]) => {
    const closed = md.reps.reduce((s,r)=>s+(r.closed||0),0);
    return { key, label: md.short, quarter: md.quarter, closed, target: md.teamTarget, complete: md.complete };
  });

  const ytdClosed = completedMonths.reduce((s,m)=>s+m.closed, 0);
  const ytdTarget = completedMonths.reduce((s,m)=>s+m.target, 0);
  const q1Months  = completedMonths.filter(m=>m.quarter==="Q1");
  const q2Months  = completedMonths.filter(m=>m.quarter==="Q2");
  const q1Closed  = q1Months.reduce((s,m)=>s+m.closed, 0);
  const q2Closed  = q2Months.reduce((s,m)=>s+m.closed, 0);
  const q1Target  = QUARTERS.Q1.teamTarget;
  const q2Target  = QUARTERS.Q2.teamTarget;

  // Per-rep YTD
  const repYTD = REPS.map(rep => {
    const byMonth = Object.entries(MONTHS).map(([key, md]) => ({
      month: md.short, closed: md.reps.find(r=>r.name===rep.name)?.closed||0
    }));
    const totalClosed = byMonth.reduce((s,m)=>s+m.closed, 0);
    const q1t = QUARTERS.Q1.repTargets[rep.name]||0;
    const q2t = QUARTERS.Q2.repTargets[rep.name]||0;
    const halfTarget = q1t + q2t;
    return { ...rep, byMonth, totalClosed, q1Target: q1t, q2Target: q2t, halfTarget, attainPct: halfTarget ? (totalClosed/halfTarget*100) : 0 };
  }).filter(r => r.halfTarget > 0);

  const trendData = completedMonths.map(m => ({
    name: m.label,
    closed: m.closed,
    target: m.target,
    attain: m.target ? Math.round(m.closed/m.target*100) : 0,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* YTD headline */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <StatBox label="YTD Closed" value={fmt(ytdClosed)} color="#00e5a0" sub={`${pct(ytdTarget ? ytdClosed/ytdTarget*100 : 0)} of target`} />
        <StatBox label="YTD Target" value={fmt(ytdTarget)} />
        <StatBox label="Q1 Final" value={pct(q1Target ? q1Closed/q1Target*100 : 0)} color={attColor(q1Closed/q1Target*100)} sub={`${fmt(q1Closed)} / ${fmt(q1Target)}`} />
        <StatBox label="Q2 MTD" value={pct(q2Target ? q2Closed/q2Target*100 : 0)} color={attColor(q2Closed/q2Target*100)} sub={`${fmt(q2Closed)} / ${fmt(q2Target)}`} />
      </div>

      {/* Q vs Q chart */}
      <div style={{ background: "linear-gradient(135deg, #0a1628, #111f35)", border: "1px solid #1e293b", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 14 }}>QUARTER vs QUARTER</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={[
            { q: "Q1 (Final)", closed: q1Closed, target: q1Target },
            { q: "Q2 (MTD)",   closed: q2Closed, target: q2Target },
          ]} barCategoryGap="40%">
            <XAxis dataKey="q" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v=>"$"+(v/1000).toFixed(0)+"k"} />
            <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} formatter={(v,n)=>[fmt(v), n==="closed"?"Closed":"Target"]} />
            <Bar dataKey="target" fill="#1e293b" radius={[4,4,0,0]} name="target" />
            <Bar dataKey="closed" radius={[4,4,0,0]} name="closed">
              <Cell fill={attColor(q1Closed/q1Target*100)} />
              <Cell fill={attColor(q2Closed/q2Target*100)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly attainment trend */}
      <div style={{ background: "linear-gradient(135deg, #0a1628, #111f35)", border: "1px solid #1e293b", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 14 }}>MONTHLY ATTAINMENT TREND</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v=>v+"%"} />
            <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} formatter={(v,n)=>[pct(v), "Attainment"]} />
            <ReferenceLine y={100} stroke="#00e5a025" strokeDasharray="3 4" />
            <Line type="monotone" dataKey="attain" stroke="#00e5a0" strokeWidth={2.5} dot={{ fill: "#00e5a0", r: 5, strokeWidth: 0 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Per-rep H1 table */}
      <div style={{ background: "linear-gradient(135deg, #0a1628, #111f35)", border: "1px solid #1e293b", borderRadius: 14, padding: 20, overflowX: "auto" }}>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 14 }}>REP H1 SUMMARY — Q1 + Q2 MTD</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 540 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b" }}>
              {["Rep","Feb","Mar","Apr","May MTD","H1 Closed","H1 Target","Attain"].map(h=>(
                <th key={h} style={{ textAlign: h==="Rep"?"left":"right", padding: "6px 10px", color: "#475569", fontSize: 9, letterSpacing: 1, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {repYTD.map(rep => {
              const col = attColor(rep.attainPct);
              const byKey = Object.fromEntries(rep.byMonth.map(m=>[m.month, m.closed]));
              return (
                <tr key={rep.name} style={{ borderBottom: "1px solid #0a1628" }}>
                  <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>{rep.short} <span style={{ color: "#475569", fontSize: 10 }}>{rep.name}</span></td>
                  {["Feb","Mar","Apr","May"].map(m=>(
                    <td key={m} style={{ padding: "8px 10px", color: "#64748b", textAlign: "right" }}>{fmt(byKey[m]||0)}</td>
                  ))}
                  <td style={{ padding: "8px 10px", color: col, textAlign: "right", fontWeight: 600 }}>{fmt(rep.totalClosed)}</td>
                  <td style={{ padding: "8px 10px", color: "#475569", textAlign: "right" }}>{fmt(rep.halfTarget)}</td>
                  <td style={{ padding: "8px 10px", color: col, textAlign: "right", fontWeight: 700 }}>{pct(rep.attainPct)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rep H1 progress bars */}
      <div style={{ background: "linear-gradient(135deg, #0a1628, #111f35)", border: "1px solid #1e293b", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 16 }}>REP H1 ATTAINMENT</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {repYTD.map(rep => {
            const col = attColor(rep.attainPct);
            return (
              <div key={rep.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "#e2e8f0" }}>{rep.name}</span>
                  <span style={{ color: "#64748b" }}>{fmt(rep.totalClosed)} / {fmt(rep.halfTarget)} <span style={{ color: col, marginLeft: 6 }}>{pct(rep.attainPct)}</span></span>
                </div>
                <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(rep.attainPct,100)}%`, background: `linear-gradient(90deg, ${col}70, ${col})`, borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Parse live sheet data into May MONTHS format ─────────────────────────────
function parseLiveData(values) {
  try {
    // Row 0 = header, rows 1-6 = reps (Ahjei, Brandon, Aram, Graydon, Chris, Henry)
    const repRows = values.slice(1, 7);
    const repNames  = ["Ahjei Holieway","Brandon Hardy","Aram Antranigian","Graydon Brown","Chris Sims","Henry Moffly"];
    const repQuotas = [8900, 8900, 6800, 6800, 6800, 0];
    const repTZ     = ["PST","PST","EST","PST","CST","PST"];

    const reps = repRows.map((r, i) => ({
      name:     repNames[i],
      quota:    repQuotas[i],
      closed:   parseFloat(r[1])  || 0,
      low:      parseFloat(r[3])  || 0,
      high:     parseFloat(r[4])  || 0,
      forecast: parseFloat(r[5])  || 0,
    }));

    // Find targets from labeled rows
    const tRow = values.find(r => String(r[0]).includes("Business Days in the Month"));
    const dRow = values.find(r => String(r[0]).includes("Days Left"));
    const pRow = values.find(r => String(r[0]).includes("Daily Pacing"));

    const businessDays = tRow ? parseFloat(tRow[1]) || 22 : 22;
    const daysLeft     = dRow ? parseFloat(dRow[1]) || 12 : 12;
    const elapsed      = businessDays - daysLeft;
    const pacingRaw    = pRow ? parseFloat(pRow[1]) : 0.4545;
    const pacingPct    = pacingRaw < 1 ? pacingRaw * 100 : pacingRaw;

    // EOW weeks — pull from header row to find EOW columns dynamically
    const header = values[0] || [];
    const eowWeeks = [];
    for (let col = 0; col < header.length; col++) {
      const h = String(header[col]);
      if (h.includes("EOW") && h.includes("Commit")) {
        const weekMatch = h.match(/EOW\s*(\d+)/);
        if (!weekMatch) continue;
        const weekNum = weekMatch[1];
        const goalCol = col + 1;
        const goalHeader = String(header[goalCol] || "");
        const goalPctMatch = goalHeader.match(/(\d+)%/);
        const goalPct = goalPctMatch ? parseFloat(goalPctMatch[1]) : 0;

        const commits = {};
        const goals   = {};
        repRows.forEach((r, i) => {
          commits[repNames[i]] = parseFloat(r[col])      || 0;
          goals[repNames[i]]   = parseFloat(r[goalCol])  || 0;
        });

        eowWeeks.push({ label: `EOW ${weekNum}`, goalPct, commits, goals });
      }
    }
    // Sort newest EOW first (highest number first)
    eowWeeks.sort((a, b) => {
      const na = parseInt(a.label.match(/\d+/)[0]);
      const nb = parseInt(b.label.match(/\d+/)[0]);
      return nb - na;
    });

    return {
      ...MONTHS.may,
      reps,
      businessDays,
      daysLeft,
      elapsed,
      pacingPct,
      eowWeeks,
    };
  } catch(e) {
    console.error("parseLiveData error:", e);
    return null;
  }
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("may");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(WORKER_URL);
        const json = await res.json();
        const values = json?.values ?? null;
        if (values) {
          const parsed = parseLiveData(values);
          if (parsed) {
            setLiveData(parsed);
            setLiveError(null);
          } else {
            // parseLiveData returned null — show first rep low value for debugging
            const debugLow = values?.[1]?.[3];
            setLiveError("Parse failed. Rep1 low=" + debugLow);
          }
        } else setLiveError("No values in response");
      } catch (e) {
        setLiveError(e.message);
      } finally {
        setLoading(false);
        setLastUpdated(new Date());
      }
    };
    load();
    const iv = setInterval(load, 60_000);
    return () => clearInterval(iv);
  }, []);

  // Tab structure mirrors the sheet
  const TAB_GROUPS = [
    { label: "Q2 FY2026", tabs: [{ key: "may", label: "May" }, { key: "Q2", label: "Q2 Rollup" }] },
    { label: "Q1 FY2026", tabs: [{ key: "apr", label: "Apr" }, { key: "mar", label: "Mar" }, { key: "feb", label: "Feb" }, { key: "Q1", label: "Q1 Rollup" }] },
    { label: "Summaries", tabs: [{ key: "summary", label: "H1 / YTD" }] },
  ];

  const liveMay = liveData || MONTHS.may;
  const mayData = enrichMonth(liveMay);

  return (
    <div style={{ fontFamily: "'DM Mono', monospace", background: "#070d1a", minHeight: "100vh", color: "#e2e8f0", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #__next { background: #070d1a !important; color: #e2e8f0; min-height: 100vh; }
        ::-webkit-scrollbar { width: 4px; height: 4px; background: #0a1628; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .tab-btn:hover { color: #94a3b8 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(180deg,#0d1b2e,#070d1a)", borderBottom: "1px solid #1e293b", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: liveData?"#00e5a0":"#f9c74f", boxShadow:`0 0 8px ${liveData?"#00e5a0":"#f9c74f"}`, animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: -0.5, color: "#f8fafc" }}>COMM+ CLOSERS</span>
            <span style={{ fontSize: 10, color: "#334155", letterSpacing: 2 }}>FORECAST</span>
            {loading   && <span style={{ fontSize: 10, color: "#475569" }}>SYNCING…</span>}
            {liveError && <span style={{ fontSize: 10, color: "#ef4444" }}>⚠ {liveError}</span>}
            {liveData && !loading && <span style={{ fontSize: 10, color: "#00e5a0" }}>● LIVE</span>}
          </div>
          <div style={{ fontSize: 10, color: "#334155", marginTop: 3 }}>
            {liveData?"LIVE DATA":"SNAPSHOT"} · updated {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ background: "#0a1628", border: "1px solid #1e293b", borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>MAY CLOSED</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#00e5a0" }}>{fmt(mayData.teamClosed)}</div>
          </div>
          <div style={{ background: "#0a1628", border: "1px solid #1e293b", borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>MAY ATTAIN</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: attColor(mayData.teamAttain) }}>{pct(mayData.teamAttain)}</div>
          </div>
          {(() => {
            const eow = getActiveEOW(MONTHS.may);
            if (!eow) return null;
            const col = attColor(eow.pacingPct);
            return (
              <div style={{ background: "#0a1628", border: `1px solid ${col}40`, borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>{eow.label.toUpperCase()} PACE</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: col }}>{pct(eow.pacingPct)}</div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Tab bar — grouped like the sheet ── */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "0 20px", display: "flex", alignItems: "stretch", overflowX: "auto", gap: 0 }}>
        {TAB_GROUPS.map((group, gi) => (
          <div key={group.label} style={{ display: "flex", alignItems: "stretch", borderRight: gi < TAB_GROUPS.length-1 ? "1px solid #1e293b" : "none", paddingRight: 8, marginRight: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 0 }}>
              <div style={{ fontSize: 8, color: "#1e293b", letterSpacing: 2, textTransform: "uppercase", padding: "4px 8px 0", whiteSpace: "nowrap" }}>{group.label}</div>
              <div style={{ display: "flex" }}>
                {group.tabs.map(tab => (
                  <button key={tab.key} className="tab-btn" onClick={() => setActiveTab(tab.key)} style={{
                    background: activeTab===tab.key ? "#111f35" : "transparent",
                    border: "none", borderBottom: activeTab===tab.key ? "2px solid #00e5a0" : "2px solid transparent",
                    color: activeTab===tab.key ? "#f1f5f9" : "#334155",
                    padding: "8px 16px", fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                    cursor: "pointer", borderRadius: "6px 6px 0 0", transition: "all 0.15s", whiteSpace: "nowrap",
                  }}>{tab.label}</button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "24px 28px", maxWidth: 1100 }}>
        {activeTab === "summary" && <SummaryView />}
        {activeTab === "Q1"      && <QuarterView quarterKey="Q1" />}
        {activeTab === "Q2"      && <QuarterView quarterKey="Q2" />}
        {["feb","mar","apr"].includes(activeTab) && <MonthView monthKey={activeTab} />}
        {activeTab === "may" && <MonthView monthKey="may" monthOverride={liveMay} />}
      </div>
    </div>
  );
}
