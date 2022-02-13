export function calculateExchangeRateInUsd(
  usdRate: number,
  currencyRate: number,
) {
  const usd = 1 / usdRate;
  const currRate = usd * currencyRate;
  const exchangeRate = 1 / currRate;
  return +exchangeRate.toFixed(5);
}
