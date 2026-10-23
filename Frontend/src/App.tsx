import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// 임시: 테마 색상 확인용 페이지
const groups = [
  {
    title: 'shadcn 표준',
    colors: [
      ['background', 'bg-background', '#F4F6FA'],
      ['foreground', 'bg-foreground', '#0A1025'],
      ['card', 'bg-card', '#FFFFFF'],
      ['primary', 'bg-primary', '#1F4FA3'],
      ['secondary', 'bg-secondary', '#EEF1F6'],
      ['secondary-foreground', 'bg-secondary-foreground', '#4C5366'],
      ['muted-foreground', 'bg-muted-foreground', '#6C7486'],
      ['accent', 'bg-accent', '#E8EEF9'],
      ['destructive', 'bg-destructive', '#B42318'],
      ['border', 'bg-border', '#E8EBF2'],
    ],
  },
  {
    title: '시안 전용',
    colors: [
      ['ink', 'bg-ink', '#141A2E'],
      ['brand-green', 'bg-brand-green', '#4CAF50'],
      ['divider', 'bg-divider', '#F4F6F9'],
      ['subtle-foreground', 'bg-subtle-foreground', '#8C95A7'],
      ['warning', 'bg-warning', '#B04A00'],
      ['warning-soft', 'bg-warning-soft', '#FEF3E2'],
      ['warning-subtle', 'bg-warning-subtle', '#FFF8EE'],
      ['danger-soft', 'bg-danger-soft', '#FDECEA'],
      ['danger-subtle', 'bg-danger-subtle', '#FFF4F3'],
      ['success', 'bg-success', '#2D834A'],
      ['success-soft', 'bg-success-soft', '#E7F5EC'],
    ],
  },
]

function App() {
  return (
    <main className="min-h-svh space-y-8 p-8">
      <h1 className="text-2xl font-bold">ERP Legend 테마 색상</h1>

      {groups.map((g) => (
        <section key={g.title}>
          <h2 className="mb-3 font-semibold">{g.title}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {g.colors.map(([name, cls, hex]) => (
              <div key={name} className="overflow-hidden rounded-xl border bg-card">
                <div className={`h-14 ${cls}`} />
                <div className="p-2 text-xs">
                  <div className="font-semibold">{name}</div>
                  <div className="text-muted-foreground">{hex}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2 className="mb-3 font-semibold">shadcn 컴포넌트 적용 예시</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>버튼</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="lg">+ 새 오더</Button>
              <Button size="lg" variant="outline">엑셀로 일괄 등록</Button>
              <Button size="lg" className="bg-ink hover:bg-ink/90">예치금 충전</Button>
              <Button size="lg" variant="outline" className="border-primary text-primary">이미지 보기</Button>
              <Button size="lg" variant="secondary">secondary</Button>
              <Button size="lg" variant="destructive">destructive</Button>
              <Button size="lg" variant="link">전체보기</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>지금 확인할 일</CardTitle>
              <CardAction>
                <Button variant="link" className="px-0">전체보기</Button>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg bg-warning-subtle p-3">
                <Badge className="bg-warning-soft text-warning">QC 확인</Badge>
                <div className="flex-1">
                  <div className="text-sm font-semibold">핸드메이드 코트 QC 이미지를 확인해 주세요</div>
                  <div className="text-xs text-muted-foreground">BEN-2026-0002 · 검품 단계 · 2시간 전 등록</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-danger-subtle p-3">
                <Badge className="bg-danger-soft text-destructive">납기 지연</Badge>
                <div className="flex-1">
                  <div className="text-sm font-semibold">워싱 데님 생산이 6일 지연되고 있어요</div>
                  <div className="text-xs text-muted-foreground">BEN-2026-0003 · 변경 납기 확인 필요</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge className="bg-warning-soft text-warning">확인 필요</Badge>
                <Badge className="bg-danger-soft text-destructive">지연</Badge>
                <Badge className="bg-success-soft text-success">정상</Badge>
                <Badge variant="secondary">견적 대기</Badge>
                <Badge className="bg-accent text-accent-foreground">우수</Badge>
                <span className="text-xs text-subtle-foreground">흐린 글자</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

export default App
