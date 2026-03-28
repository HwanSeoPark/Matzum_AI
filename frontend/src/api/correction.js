async function parseError(res) {
  let detail = res.statusText;
  try {
    const j = await res.json();
    if (j.detail) {
      detail =
        typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    }
  } catch {
    /* ignore */
  }
  return new Error(detail);
}

export async function postCheckGrammar(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/check-grammar/", { method: "POST", body: form });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function postCheckGrammarText(text) {
  const res = await fetch("/api/check-grammar/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function postRecommendStyle(corrected) {
  const res = await fetch("/api/recommend-style/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ corrected }),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}
