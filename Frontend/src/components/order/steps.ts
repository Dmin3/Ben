// 오더 진행 단계 순서. 인덱스가 서버의 진행 단계 값과 맞아야 한다
export const ORDER_STEPS = ['sample', 'mass', 'inbound', 'inspection', 'outbound', 'customs', 'delivery'] as const
export type OrderStep = (typeof ORDER_STEPS)[number]
