import { appIcon } from "@/lib/app-icon";

// Android home-screen icons listed in the web app manifest (192 and 512 px).
const sizes = ["192", "512"];

export function generateStaticParams() {
  return sizes.map((size) => ({ size }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  if (!sizes.includes(size)) return new Response("Not found", { status: 404 });
  return appIcon(Number(size));
}
