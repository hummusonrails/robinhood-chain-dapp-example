import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// favicon, the lime basket mark from the site header
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#CCFF00",
          borderRadius: 14,
          color: "#110E08",
          fontSize: 44,
          fontWeight: 800,
        }}
      >
        B
      </div>
    ),
    size,
  );
}
