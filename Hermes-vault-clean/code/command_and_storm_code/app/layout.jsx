export const metadata = {
  title: "Empire AI - Predictive Revenue",
  description: "Automated growth engine and diagnostic builder.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ backgroundColor: '#020808', color: 'white', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
