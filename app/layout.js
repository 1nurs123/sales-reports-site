export const metadata = { title: 'Sales Reports' };

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: 'Arial, system-ui' }}>
        {children}
      </body>
    </html>
  );
}
