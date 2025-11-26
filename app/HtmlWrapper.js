'use client';

export default function HtmlWrapper({ children, className = '', ...props }) {
  return (
    <html {...props} className={className} suppressHydrationWarning>
      {children}
    </html>
  );
}
