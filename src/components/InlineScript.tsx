// A script that runs while the page is first parsed (before paint). On the client
// React renders it as inert text/plain, which avoids React's script-tag warning.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
