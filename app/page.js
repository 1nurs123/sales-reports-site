'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const fmt = (n) => Number(n || 0).toLocaleString('ru-RU');

export default function Home() {
  const [rows, setRows] = useState([]);
  const [dept, setDept] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortLb, setSortLb] = useState({ by: 'revenue', dir: 'desc' });
  const [sortArch, setSortArch] = useState({ by: 'period_start', dir: 'desc' });

  useEffect(() => {
    supabase.from('weekly_sales').select('*').order('period_start', { ascending: false })
      .then(({ data, error }) => { if (!error && data) setRows(data); });
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(rows.map(r => r.department))).sort(),
    [rows]
  );

  const filtered = useMemo(() =>
    rows.filter(r => {
      if (dept && r.department !== dept) return false;
      if (from && r.period_start < from) return false;
      if (to && r.period_start > to) return false;
      return true;
    }),
  [rows, dept, from, to]);

  // Лидерборд
  const leaderboard = useMemo(() => {
    const map = new Map();
    filtered.forEach(r => {
      const key = r.manager || 'Не указан';
      const curr = map.get(key) || { manager: key, revenue: 0, deals: 0 };
      curr.revenue += Number(r.revenue || 0);
      curr.deals += Number(r.deals_count || 0);
      map.set(key, curr);
    });
    const arr = Array.from(map.values());
    arr.sort((a,b) => {
      const dir = sortLb.dir === 'asc' ? 1 : -1;
      if (sortLb.by === 'revenue') return (a.revenue - b.revenue) * dir;
      return (a.deals - b.deals) * dir;
    });
    return sortLb.dir === 'asc' ? arr : arr.reverse();
  }, [filtered, sortLb]);

  // Архив
  const archive = useMemo(() => {
    const arr = [...filtered];
    const dir = sortArch.dir === 'asc' ? 1 : -1;
    arr.sort((a,b) => {
      if (sortArch.by === 'period_start') return (new Date(a.period_start) - new Date(b.period_start)) * dir;
      if (sortArch.by === 'revenue') return ((a.revenue||0)-(b.revenue||0)) * dir;
      if (sortArch.by === 'deals') return ((a.deals_count||0)-(b.deals_count||0)) * dir;
      return String(a[sortArch.by]||'').localeCompare(String(b[sortArch.by]||'')) * dir;
    });
    return arr;
  }, [filtered, sortArch]);

  const toggle = (setter, curr, by) => {
    setter({ by, dir: curr.by === by && curr.dir === 'desc' ? 'asc' : 'desc' });
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <h1>Лидерборд <span className="badge">{leaderboard.length} менеджеров</span></h1>
        <div className="controls">
          <label>Отдел:
            <select value={dept} onChange={e => setDept(e.target.value)}>
              <option value="">Все</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label>С даты:
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </label>
          <label>По дату:
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </label>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Менеджер</th>
              <th className="right clickable" onClick={() => toggle(setSortLb, sortLb, 'revenue')}>
                Выручка {sortLb.by==='revenue' ? (sortLb.dir==='desc' ? '▼' : '▲') : ''}
              </th>
              <th className="right clickable" onClick={() => toggle(setSortLb, sortLb, 'deals')}>
                Сделки {sortLb.by==='deals' ? (sortLb.dir==='desc' ? '▼' : '▲') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((r, i) => (
              <tr key={r.manager}>
                <td>{i + 1}</td>
                <td>{r.manager}</td>
                <td className="right">{fmt(r.revenue)}</td>
                <td className="right">{r.deals}</td>
              </tr>
            ))}
            {!leaderboard.length && <tr><td colSpan="4" style={{ textAlign: 'center', padding: 16 }}>Нет данных</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Архив строк <span className="badge">{archive.length}</span></h2>
        <table className="table">
          <thead>
            <tr>
              <th className="clickable" onClick={() => toggle(setSortArch, sortArch, 'period_start')}>
                Период {sortArch.by==='period_start' ? (sortArch.dir==='desc' ? '▼' : '▲') : ''}
              </th>
              <th>Отдел</th>
              <th>Партнёр</th>
              <th>Менеджер</th>
              <th className="right clickable" onClick={() => toggle(setSortArch, sortArch, 'revenue')}>
                Выручка {sortArch.by==='revenue' ? (sortArch.dir==='desc' ? '▼' : '▲') : ''}
              </th>
              <th className="right clickable" onClick={() => toggle(setSortArch, sortArch, 'deals')}>
                Сделки {sortArch.by==='deals' ? (sortArch.dir==='desc' ? '▼' : '▲') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {archive.map(r => (
              <tr key={r.id}>
                <td>{r.period_start} — {r.period_end}</td>
                <td>{r.department}</td>
                <td>{r.partner || ''}</td>
                <td>{r.manager}</td>
                <td className="right">{fmt(r.revenue)}</td>
                <td className="right">{r.deals_count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
