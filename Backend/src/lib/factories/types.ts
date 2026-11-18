export type FactoryListQuery = {
  q?: string;
  page: number;
  size: number;
  sort: "name" | "deals" | "amount" | "onTimeRate" | "defectRate" | "avgLeadDays";
  direction: "asc" | "desc";
};

export type FactoryMemoInput = { memo: string | null };
