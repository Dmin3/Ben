// parseCsv 확인용. 실행: node src/lib/csv.check.ts
import { parseCsv } from './csv.ts'

const eq = (a: unknown, b: unknown) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${JSON.stringify(a)} !== ${JSON.stringify(b)}`)
}

eq(parseCsv('﻿a,b\r\n1,2\r\n'), [['a', 'b'], ['1', '2']])
eq(parseCsv('"x, y","say ""hi""",z'), [['x, y', 'say "hi"', 'z']])
eq(parseCsv('"line1\nline2",2\n\n,\n3,'), [['line1\nline2', '2'], ['3', '']])
eq(parseCsv('a,,c'), [['a', '', 'c']])
console.log('csv ok')
