import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// apple touch icon, solid background required since ios squares the corners
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#110E08",
        }}
      >
        <div
          style={{
            width: 128,
            height: 128,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#CCFF00",
            borderRadius: 28,
            color: "#110E08",
            fontSize: 88,
            fontWeight: 800,
          }}
        >
          B
        </div>
      </div>
    ),
    size,
  );
}
