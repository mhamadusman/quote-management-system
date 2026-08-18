// database/seeders/corridor_seeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
//import { CorridorSchema as Corridor } from '#models/corridor'
import Corridor from '#models/corridor'

const RECORD_COUNT = 3000

const regions = [
  {
    name: 'Europe',
    countries: [
      'Denmark',
      'Germany',
      'France',
      'UK',
      'Sweden',
      'Norway',
      'Finland',
      'Netherlands',
      'Belgium',
      'Spain',
      'Italy',
      'Poland',
      'Switzerland',
      'Austria',
    ],
    currencies: ['EUR', 'GBP', 'DKK', 'NOK', 'SEK', 'CHF', 'PLN'],
    systems: ['SEPA', 'SWIFT', 'Local ACH', 'Real-Time Payments'],
  },
  {
    name: 'Asia',
    countries: [
      'India',
      'China',
      'Japan',
      'South Korea',
      'Singapore',
      'Thailand',
      'Malaysia',
      'Indonesia',
      'Philippines',
      'Vietnam',
      'Bangladesh',
    ],
    currencies: ['INR', 'CNY', 'JPY', 'KRW', 'SGD', 'THB', 'MYR', 'IDR', 'PHP', 'VND', 'BDT'],
    systems: ['IMPS', 'NEFT', 'RTGS', 'Local ACH', 'SWIFT'],
  },
  {
    name: 'North America',
    countries: ['USA', 'Canada', 'Mexico'],
    currencies: ['USD', 'CAD', 'MXN'],
    systems: ['ACH', 'FedWire', 'SWIFT', 'Local ACH'],
  },
  {
    name: 'South America',
    countries: ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
    currencies: ['BRL', 'ARS', 'CLP', 'COP', 'PEN'],
    systems: ['TED', 'Local ACH', 'SWIFT'],
  },
  {
    name: 'Africa',
    countries: ['South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Morocco', 'Egypt'],
    currencies: ['ZAR', 'NGN', 'KES', 'GHS', 'MAD', 'EGP'],
    systems: ['RTGS', 'Local ACH', 'Mobile Money', 'SWIFT'],
  },
  {
    name: 'Oceania',
    countries: ['Australia', 'New Zealand'],
    currencies: ['AUD', 'NZD'],
    systems: ['NPP', 'Local ACH', 'SWIFT'],
  },
]

const transactionTypes = ['B2C', 'B2B', 'C2C']
const services = ['BankAccount', 'MobileWallet', 'CashPickup', 'Card']
const receivingPartners = [
  'Banking Circle S.A. (BankingCircle Luxembourg)',
  'Thunes Business Hub',
  'Local Bank Network',
  'Payment Network Ltd.',
  'Global Remittance Partner',
  'Regional Mobile Money Provider',
  'Clearing House Co.',
  'Digital Wallet Platform',
]

const fxSources = ['Reuters Bid rates', 'Reuters Ask rates', 'Market rate', 'ECB reference rates']

class SeededRandom {
  state: number

  constructor(seed: number) {
    this.state = seed >>> 0
  }

  next() {
    this.state ^= this.state << 13
    this.state ^= this.state >>> 17
    this.state ^= this.state << 5
    return (this.state >>> 0) / 0xffffffff
  }

  range(min: number, max: number) {
    return min + this.next() * (max - min)
  }

  int(min: number, max: number) {
    return Math.floor(this.range(min, max + 1))
  }

  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }

  boolean(probability = 0.5) {
    return this.next() < probability
  }
}

function round(value: number, decimals: number) {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

function generatePayer(country: string, currency: string, paymentSystem: string) {
  return `All Banks ${country} / ${currency} / Payment System: ${paymentSystem}`
}

export default class extends BaseSeeder {
  async run() {
    const rng = new SeededRandom(20260811)
    const records = []

    for (let i = 0; i < RECORD_COUNT; i += 1) {
      const regionData = rng.pick(regions)
      const country = rng.pick(regionData.countries)
      const payoutCurrency = rng.pick(regionData.currencies)
      const paymentSystem = rng.pick(regionData.systems)
      const transactionType = rng.pick(transactionTypes)
      const service = rng.pick(services)
      const receivingPartner = rng.pick(receivingPartners)

      const historicalATV = round(rng.range(100, 2000), 6)
      const atvUSD = Math.round(historicalATV)
      const stdFixedFeeUSD = round(rng.range(0.5, 5.0), 1)
      const variableFeePercentage = round(rng.range(0, 3.5), 2)
      const defaultFxSpread = round(rng.range(0.5, 3.0), 1)
      const treasuryFxCost = round(rng.range(0.05, 0.5), 2)
      const costFixedPerUSD = round(rng.range(0.01, 0.15), 15)
      const costVariablePerTrx = round(rng.range(0, 1.0), 2)
      const needsApproval = rng.boolean(0.1)

      const corridorId = 10000 + i

      records.push({
        id: String(corridorId),
        versionId: rng.int(1, 50),
        sourceRowId: String(200000 + i),
        region: regionData.name,
        country: country,
        transactionType: transactionType,
        service: service,
        receivingPartner: receivingPartner,
        payer: generatePayer(country, payoutCurrency, paymentSystem),
        payoutCurrency: payoutCurrency,
        historicalAtv: String(historicalATV),
        atvUsd: String(atvUSD),
        stdFixedFeeUsd: String(stdFixedFeeUSD),
        variableFeePercentage: String(variableFeePercentage),
        fxSource: rng.pick(fxSources),
        defaultFxSpread: String(defaultFxSpread),
        treasuryFxCost: String(treasuryFxCost),
        costFixedPerUsd: String(costFixedPerUSD),
        costVariablePerTrx: String(costVariablePerTrx),
        needsApproval: needsApproval,
      })
    }

    await Corridor.createMany(records)
  }
}
