import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { currentUser, deposit, factories, notices, orders, todos } from '@/mocks/customer-home'
import { DepositCard } from './deposit-card'
import { FactoryCard } from './factory-card'
import { NoticeCard } from './notice-card'
import { OrderTable } from './order-table'
import { TodoCard } from './todo-card'

export default function CustomerHome() {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-4 pb-2">
        <div>
          <h1 className="text-[22px] font-bold">{t('home.greeting', { name: currentUser.name })}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <Trans i18nKey="home.pending" values={{ count: todos.length }} components={{ b: <b className="text-warning" /> }} />
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 px-4 font-semibold">
            {t('home.excelUpload')}
          </Button>
          <Button nativeButton={false} render={<Link to="/orders/new" />} className="h-9 px-4 font-semibold">
            {t('home.newOrder')}
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <TodoCard items={todos} />
        <DepositCard deposit={deposit} />
      </div>

      <OrderTable orders={orders} />

      <div className="grid gap-4 lg:grid-cols-2">
        <NoticeCard notices={notices} />
        <FactoryCard factories={factories} />
      </div>
    </div>
  )
}
