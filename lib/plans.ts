export type Plan = {
  id: string
  name: string
  price: number
  credits: number
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    credits: 1,
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 299,
    credits: 10,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 999,
    credits: 50,
  },
}

export function getPlan(planId: string): Plan {
  return PLANS[planId] ?? PLANS.free
}
