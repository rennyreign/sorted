export const phoneMessages = [
  { from: "assistant", text: "New enquiry from Sam in Leeds (LS6). Boiler's stopped heating and there's water under it. Wants someone today." },
  { from: "assistant", text: "I've asked Sam if it's still leaking and how old the boiler is." },
  { from: "assistant", text: "Sam says it's still dripping. It's a Worcester, about 9 years old. I've marked it urgent and got a quote ready from your prices." },
  { from: "owner", text: "Looks good. Send it." },
  { from: "assistant", text: "Sent to Sam. I'll chase tomorrow morning if there's no reply.", tick: true },
] as const

export const phoneRecord = [
  ["Need", "Boiler not heating"],
  ["Priority", "Urgent, active leak"],
  ["Quote", "Draft from your prices"],
] as const
