import React from "react";
import { useState } from "react";

export default function Cursor({ mouseX, mouseY, color }) {
  return (
    <div
      className={`w-0 h-0 absolute `}
      style={{
        top: mouseY * window.innerHeight,
        left: mouseX * window.innerWidth,
        borderTop: `15px solid ${color}`,
        borderRight: "15px solid transparent",
        rotate: "15deg",
      }}
    />
  );
}
