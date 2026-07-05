import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Index Baskets on Robinhood Chain, an interactive live testnet walkthrough";

// social share card in the robinhood chain palette
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #110E08 0%, #1D1A14 55%, #110E08 100%)",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 72,
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#CCFF00",
              borderRadius: 16,
              color: "#110E08",
              fontSize: 48,
              fontWeight: 800,
            }}
          >
            B
          </div>
          <div
            style={{
              color: "#888784",
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            Interactive walkthrough · live testnet
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            Index Baskets on Robinhood Chain
          </div>
          <div style={{ color: "#BFBFBF", fontSize: 34, lineHeight: 1.35 }}>
            Mint and redeem baskets of tokenized stocks, priced live by
            Chainlink, one step at a time.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["Solidity", "Foundry", "Chainlink", "ERC-8056", "Next.js", "wagmi"].map(
            (pill) => (
              <div
                key={pill}
                style={{
                  display: "flex",
                  padding: "12px 26px",
                  borderRadius: 999,
                  border: "2px solid rgba(204, 255, 0, 0.35)",
                  background: "rgba(204, 255, 0, 0.10)",
                  color: "#CCFF00",
                  fontSize: 24,
                }}
              >
                {pill}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    size,
  );
}
