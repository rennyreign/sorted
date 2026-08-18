import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT_FAMILY } from "../theme";

/**
 * A CSS-built browser mockup standing in for a real screenshot.
 * Swap this out for an <Img src={staticFile(...)}/> once real
 * before/after captures exist — every scene that consumes a
 * "website" reads through this single component, so the swap
 * happens in one place.
 */
export const WebsiteMockup: React.FC<{
  variant: "before" | "after";
  businessName: string;
}> = ({ variant, businessName }) => {
  const isAfter = variant === "after";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        border: `1px solid ${isAfter ? "#2A2A2A" : "#3A3A3A"}`,
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* browser chrome */}
      <div
        style={{
          height: 34,
          background: "#1C1C1E",
          display: "flex",
          alignItems: "center",
          gap: 6,
          paddingLeft: 14,
        }}
      >
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div
            key={c}
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: c,
            }}
          />
        ))}
      </div>

      {/* page body */}
      <AbsoluteFill
        style={{
          top: 34,
          background: isAfter ? "#0F0F10" : "#E9E7E2",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: isAfter ? COLORS.white : "#2B2A28",
              letterSpacing: -0.5,
            }}
          >
            {businessName}
          </div>
          {isAfter ? (
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: COLORS.black,
                background: COLORS.good,
                borderRadius: 999,
                padding: "8px 16px",
              }}
            >
              Book a Table
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#8A8578" }}>Home · Menu · Contact</div>
          )}
        </div>

        {/* hero block */}
        <div
          style={{
            flex: 1,
            borderRadius: isAfter ? 10 : 2,
            background: isAfter
              ? "linear-gradient(135deg, #232326 0%, #161617 100%)"
              : "#D8D4C8",
            display: "flex",
            alignItems: "flex-end",
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: isAfter ? 30 : 20,
              fontWeight: isAfter ? 700 : 400,
              color: isAfter ? COLORS.white : "#6B6656",
              maxWidth: "70%",
              lineHeight: 1.2,
            }}
          >
            {isAfter ? "Fresh. Local. Open Late." : "Welcome to our website"}
          </div>
        </div>

        {/* row of cards */}
        <div style={{ display: "flex", gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 46,
                borderRadius: isAfter ? 8 : 0,
                background: isAfter ? "#1D1D1F" : "#DFDBCE",
                border: isAfter ? "1px solid #2C2C2E" : "1px solid #C9C4B4",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </div>
  );
};
