export function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[\s]*[=+@-]/.test(text) && !/^-?\d+(\.\d+)?$/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function transactionCsv(items: Record<string, unknown>[]) {
  const columns = ["date", "description", "orderId", "amount", "balance"];
  return "\uFEFF" + [columns, ...items.map(row => columns.map(key => row[key]))]
    .map(row => row.map(csvCell).join(",")).join("\r\n");
}
