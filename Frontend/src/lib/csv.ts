// 엑셀에서 열고 저장하는 CSV 내려받기·읽기. ponytail: .xlsx는 라이브러리(SheetJS)가 필요해 CSV만 받는다

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

/** 따옴표 안의 쉼표·줄바꿈·"" 를 처리한다. 빈 줄은 버린다 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const src = text.replace(/^﻿/, '')
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c !== '"') cell += c
      else if (src[i + 1] === '"') cell += src[i++]
      else quoted = false
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += c
  }
  if (cell || row.length) rows.push([...row, cell])
  return rows.filter((r) => r.some((v) => v.trim()))
}

/** 엑셀 "CSV UTF-8"과 기본 "CSV(쉼표로 분리)"(한글 Windows는 EUC-KR) 둘 다 읽는다 */
export async function readCsvFile(file: File) {
  const buf = await file.arrayBuffer()
  try {
    return parseCsv(new TextDecoder('utf-8', { fatal: true }).decode(buf))
  } catch {
    return parseCsv(new TextDecoder('euc-kr').decode(buf))
  }
}
