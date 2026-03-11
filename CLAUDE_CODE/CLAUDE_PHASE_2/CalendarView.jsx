import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const STATUS_COLOR = {
    backlog:    '#888888',
    todo:       '#4a9eff',
    inprogress: '#f2aa4d',
    inreview:   '#a855f7',
    onhold:     '#fb923c',
    done:       '#2dd4bf',
    complete:   '#84cc16',
};

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView() {
    const navigate = useNavigate();
    const createdProjects = useSelector(s => s.registration.createdProjects);
    const assignedProjects = useSelector(s => s.registration.assignedProjects);
    const allProjects = [...createdProjects, ...assignedProjects];

    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());

    const goBack = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const goForward = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };
    const goToday = () => { setMonth(now.getMonth()); setYear(now.getFullYear()); };

    // Build a 6-row × 7-col grid
    const firstDayOfMonth = new Date(year, month, 1).getDay();   // 0=Sun
    const daysInMonth     = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];
    // Leading days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        cells.push({ day: daysInPrevMonth - i, inMonth: false, dateStr: null });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        cells.push({ day: d, inMonth: true, dateStr: ds });
    }
    // Trailing days from next month
    const remainder = 42 - cells.length;
    for (let d = 1; d <= remainder; d++) {
        cells.push({ day: d, inMonth: false, dateStr: null });
    }

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const projectsOnDate = (ds) => ds ? allProjects.filter(p => p.date === ds) : [];

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a18', color: '#e0e0e0', fontFamily: "'Inter', sans-serif" }}>

            {/* ── Header ── */}
            <div style={{ background: '#13132b', borderBottom: '1px solid #1e1e3a', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => navigate('/projects')}
                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 0 }}>←</button>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f0f0f0' }}>Calendar</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={goBack}
                        style={{ padding: '6px 14px', background: '#0f0f24', border: '1px solid #1e1e3a', borderRadius: 6, color: '#888', cursor: 'pointer', fontSize: 16 }}>‹</button>
                    <span style={{ fontSize: 17, fontWeight: 700, minWidth: 190, textAlign: 'center', color: '#f0f0f0' }}>
                        {MONTH_NAMES[month]} {year}
                    </span>
                    <button onClick={goForward}
                        style={{ padding: '6px 14px', background: '#0f0f24', border: '1px solid #1e1e3a', borderRadius: 6, color: '#888', cursor: 'pointer', fontSize: 16 }}>›</button>
                    <button onClick={goToday}
                        style={{ padding: '6px 14px', background: '#0d2540', border: '1px solid #4a9eff55', borderRadius: 6, color: '#4a9eff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                        Today
                    </button>
                </div>
            </div>

            <div style={{ padding: '20px 24px' }}>

                {/* Day-of-week headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 }}>
                    {DAY_NAMES.map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 0' }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                    {cells.map((cell, i) => {
                        const isToday  = cell.dateStr === todayStr;
                        const projects = projectsOnDate(cell.dateStr);

                        return (
                            <div key={i} style={{
                                minHeight: 100,
                                background: isToday ? '#0d2035' : cell.inMonth ? '#13132b' : '#0c0c1f',
                                border: `1px solid ${isToday ? '#4a9eff55' : '#1a1a30'}`,
                                borderRadius: 7,
                                padding: '7px 7px 6px',
                                overflow: 'hidden',
                            }}>
                                {/* Day number */}
                                <div style={{
                                    fontSize: 12, fontWeight: isToday ? 700 : 400,
                                    color: isToday ? '#4a9eff' : cell.inMonth ? '#aaa' : '#333',
                                    marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <span>{cell.day}</span>
                                    {isToday && (
                                        <span style={{ fontSize: 9, background: '#4a9eff', color: '#fff', borderRadius: 6, padding: '1px 5px', fontWeight: 700 }}>TODAY</span>
                                    )}
                                </div>

                                {/* Project pills */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {projects.slice(0, 3).map(p => {
                                        const c = STATUS_COLOR[p.status] || '#888';
                                        return (
                                            <div key={p._id} onClick={() => navigate(`/projects/${p._id}`)}
                                                title={`${p.Title} — ${p.status}`}
                                                style={{
                                                    background: c + '1a',
                                                    border: `1px solid ${c}44`,
                                                    color: c,
                                                    borderRadius: 4,
                                                    padding: '2px 5px',
                                                    fontSize: 10,
                                                    cursor: 'pointer',
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap',
                                                    textOverflow: 'ellipsis',
                                                    lineHeight: 1.4,
                                                    transition: 'opacity 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                {p.Title}
                                            </div>
                                        );
                                    })}
                                    {projects.length > 3 && (
                                        <div style={{ fontSize: 10, color: '#555', paddingLeft: 2 }}>+{projects.length - 3} more</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div style={{ marginTop: 20, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {Object.entries(STATUS_COLOR).map(([key, color]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 9, height: 9, borderRadius: 2, background: color }} />
                            <span style={{ fontSize: 11, color: '#555', textTransform: 'capitalize' }}>{key}</span>
                        </div>
                    ))}
                </div>

                <p style={{ textAlign: 'center', color: '#333', fontSize: 12, marginTop: 8 }}>
                    Projects shown on their due date · Click to open details
                </p>
            </div>
        </div>
    );
}
