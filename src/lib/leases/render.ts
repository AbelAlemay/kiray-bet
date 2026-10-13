// Fills in a lease template. Template syntax (kept small so a lawyer can edit it):
//   {{field}}                         replaced with the value (or a blank line to fill by hand)
//   {{#if field}} … {{else}} … {{/if}}   shown only when the field is on / filled in
//   {{! note }}                       a note for the attorney; never shown in a lease
// The result is plain text in a small markdown subset (see LeaseDocument).

export type LeaseValues = Record<string, string | boolean | undefined>;

const blank = "______________________";

function isSet(value: LeaseValues[string]) {
  return typeof value === "boolean" ? value : !!value?.trim();
}

export function stripNotes(template: string) {
  return template.replace(/\{\{![\s\S]*?\}\}\n?/g, "");
}

export function renderLease(template: string, values: LeaseValues) {
  let text = stripNotes(template);
  // Innermost conditionals first, so nested ones work too.
  const conditional = /\{\{#if (\w+)\}\}((?:(?!\{\{#if )[\s\S])*?)(?:\{\{else\}\}((?:(?!\{\{#if )[\s\S])*?))?\{\{\/if\}\}/;
  for (let guard = 0; guard < 500 && conditional.test(text); guard++) {
    text = text.replace(conditional, (_, field, yes, no = "") => (isSet(values[field]) ? yes : no));
  }
  text = text.replace(/\{\{(\w+)\}\}/g, (_, field) => {
    const value = values[field];
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return value?.trim() ? value.trim() : blank;
  });
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

// Fields a template uses, for the editor's reference list.
export function fieldsUsed(template: string) {
  const names = new Set<string>();
  for (const m of stripNotes(template).matchAll(/\{\{(?:#if )?(\w+)\}\}/g)) {
    if (m[1] !== "else") names.add(m[1]);
  }
  return [...names];
}
