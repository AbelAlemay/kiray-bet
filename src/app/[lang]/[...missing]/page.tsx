import { notFound } from "next/navigation";

// Any address that isn't a page shows our own "not found" page, in the visitor's language.
export default function Missing() {
  notFound();
}
