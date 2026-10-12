import { test } from "node:test"
import assert from "node:assert/strict"
import { MARKET_PRICING, formatMoney, marketCopy, parseMarket, resolveWorkspaceOffer } from "./market-pricing.ts"

const gbpOffer = { ...MARKET_PRICING.UK, stripePaymentUrl: "https://example.test/gbp", bankTransferEnabled: true }

test("fixed market prices and payment splits match the approved offer", () => {
  assert.equal(marketCopy("{total}: {deposit} + {balance}", "US"), "$3,500: $1,750 + $1,750")
  assert.equal(marketCopy("{total}: {deposit} + {balance}", "UK"), "£3,000: £1,500 + £1,500")
  for (const offer of Object.values(MARKET_PRICING)) assert.equal(offer.total, offer.deposit + offer.balance)
})

test("only explicit offer tokens change; historical figures stay intact", () => {
  assert.equal(marketCopy("£8,400 recovered; quoted £500; offer {total}", "US"), "£8,400 recovered; quoted £500; offer $3,500")
  assert.equal(parseMarket("US"), "US")
  assert.equal(parseMarket("GBP"), "UK")
  assert.equal(parseMarket("invalid"), null)
})

test("US offers never inherit GBP checkout or bank details", () => {
  const usd = resolveWorkspaceOffer(gbpOffer, { currency: "USD" })
  assert.equal(usd.total, 3500)
  assert.equal(usd.deposit, 1750)
  assert.equal(usd.balance, 1750)
  assert.equal(usd.stripePaymentUrl, "")
  assert.equal(usd.bankTransferEnabled, false)
  assert.equal(resolveWorkspaceOffer(gbpOffer, { currency: "USD", stripePaymentUrl: "https://example.test/usd" }).stripePaymentUrl, "https://example.test/usd")
})

test("authored and existing UK offers retain their actual amounts and checkout", () => {
  assert.deepEqual(resolveWorkspaceOffer(gbpOffer), gbpOffer)
  const custom = resolveWorkspaceOffer(gbpOffer, { total: 500, deposit: 250, balance: 250, stripePaymentUrl: "https://example.test/custom" })
  assert.equal(formatMoney(custom.deposit, custom.currency), "£250")
  assert.equal(custom.total, 500)
  assert.equal(custom.stripePaymentUrl, "https://example.test/custom")
  assert.equal(formatMoney(12.5, "USD", true), "$12.50")
})
