export const metadata = { title: 'Sales Reports', description: 'Еженедельные отчёты и лидерборд' };

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' }}>
        <header style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
          <b>Sales Reports</b> — лидерборд и архив
        </header>
        <main style={{ maxWidth: 1000, margin: '16px auto', padding: '0 16px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
