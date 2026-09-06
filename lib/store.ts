type UserStore = {
  credits: number
  plan: string
}

const users = new Map<string, UserStore>()

export function getUser(userId: string): UserStore {
  if (!users.has(userId)) {
    users.set(userId, {
      credits: 1,
      plan: "free",
    })
  }

  return users.get(userId)!
}

export function addCredits(userId: string, amount: number) {
  const user = getUser(userId)

  user.credits += amount

  return user
}

export function useCredits(userId: string, amount = 1) {
  const user = getUser(userId)

  if (user.credits < amount) {
    throw new Error("Insufficient credits")
  }

  user.credits -= amount

  return user
}

export function setPlan(userId: string, plan: string) {
  const user = getUser(userId)

  user.plan = plan

  return user
}
