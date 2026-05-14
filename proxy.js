export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const url = "https://script.google.com/macros/s/AKfycbzRyuIF5rtToW4vysM65NAjcBUBDLBv2Poxmb6FYUHV_aurkdCIgiryN1DQRDftwl1P/exec";
  const response = await fetch(url, { redirect: "follow" });
  const data = await response.json();
  res.status(200).json(data);
}
