const MATH_OR_CODE = /```[\s\S]*?```|`[^`\n]*`|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)/g;

export default function normalizeMathMarkdown(text = "") {
  return text.replace(MATH_OR_CODE, (token) => {
    if (token.startsWith("`")) return token;
    const delimiter = token.startsWith("\\[") ? "$$" : "$";
    return `${delimiter}${token.slice(2, -2)}${delimiter}`;
  });
}
