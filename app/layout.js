import './globals.css';

export const metadata = { title: 'Sales Reports' };

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
