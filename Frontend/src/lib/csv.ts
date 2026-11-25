// 엑셀에서 바로 열리는 CSV 내려받기

/** 따옴표로 감싼 CSV를 만들어 내려받는다. BOM을 붙여 엑셀에서 한글이 깨지지 않게 한다 */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
