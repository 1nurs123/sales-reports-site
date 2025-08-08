'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [rows, setRows] = useState([]);
  const [dept, setDept] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    supabase.from('weekly_sales').select('*').order('period_start', { ascending: false })
      .then(({ data, error }) => { if (!error && data) setRows(data); });
  }, []);

  const departments = useMemo(() => Array.from(new Set(rows.map(r => r.department))).sort(), [rows]);

  const filtered = useMemo(() =>
    rows.filter(r => (!dept || r.department === dept) && (!from || r.period_start >= from) && (!to || r.period_start <= to)),
    [rows, dept, from, to]
  );

  const leaderboard = useMemo(() => {
    const map = new Map();
    filtered.forEach(r => {
      const key = r.manager || 'Не указан';
      const curr = map.get(key) || { manager: key, revenue: 0, deals: 0 };
      curr.revenue += Number(r.revenue || 0);
      curr.deals += Number(r.deals_count || 0);
      map.set(key, curr);
    });
    return Array.from(map.values()).sort((a,b)=>b.revenue-a.revenue);
  }, [filtered]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Лидерборд</h1>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <label>Отдел: <select value={dept} onChange={e=>setDept(e.target.value)}>
          <option value="">Все</option>{departments.map(d=><option key={d} value={d}>{d}</option>)}
        </select></label>
        <label>С даты: <input type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label>
        <label>По дату: <input type="date" value={to} onChange={e=>setTo(e.target.value)} /></label>
      </div>

      <table width="100%" cellPadding="8" style={{ borderCollapse:'collapse', marginBottom:24 }}>
        <thead><tr><th align="left">#</th><th align="left">Менеджер</th><th align="right">Выручка</th><th align="right">Сделки</th></tr></thead>
        <tbody>
          {leaderboard.map((r,i)=>(
            <tr key={r.manager}><td>{i+1}</td><td>{r.manager}</td><td align="right">{r.revenue.toLocaleString()}</td><td align="right">{r.deals}</td></tr>
          ))}
          {leaderboard.length===0 && <tr><td colSpan="4" align="center">Нет данных</td></tr>}
        </tbody>
      </table>

      <h2>Архив строк</h2>
      <table width="100%" cellPadding="8" style={{ borderCollapse:'collapse' }}>
        <thead><tr><th align="left">Период</th><th align="left">Отдел</th><th align="left">Партнёр</th><th align="left">Менеджер</th><th align="right">Выручка</th><th align="right">Сделки</th></tr></thead>
        <tbody>
          {filtered.map(r=>(
            <tr key={r.id}>
              <td>{r.period_start} — {r.period_e
