export const metadata = {
  title: "Microminimus Assistant",
  description: "AI Sales Assistant for Microminimus",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
