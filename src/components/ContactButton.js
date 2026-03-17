'use client'

import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function ContactButton({ label = "Contact", onClick }) {
  const [hovered, setHovered] = useState(false);
  const [angle, setAngle] = useState(62);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  const animateTo = (targetAngle) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const from = angle;
    const duration = 400;
    startTimeRef.current = performance.now();
    const tick = (now) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (targetAngle - from) * eased;
      setAngle(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const handleMouseEnter = () => { setHovered(true); animateTo(224); };
  const handleMouseLeave = () => { setHovered(false); animateTo(62); };

  const conicGradient = `conic-gradient(from ${angle}deg, rgba(255,255,255,0) 249deg, #b2adc7 249.6deg)`;

  const layerBase = {
    position: "absolute",
    inset: 0,
    borderRadius: "8px",
    overflow: "hidden",
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 2000, damping: 110, mass: 1 }}
      style={{
        appearance: "none",
        border: "none",
        background: "none",
        font: "inherit",
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0",
        width: "104px",
        height: "44px",
        borderRadius: "8px",
        cursor: "pointer",
        overflow: "visible",
        userSelect: "none",
        flexShrink: 0,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div style={{ ...layerBase, backgroundColor: "#151A1E" }} />
      <div style={{ ...layerBase, background: conicGradient, opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease" }} />
      <div style={{ ...layerBase, background: conicGradient, filter: "blur(8px)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease" }} />
      <div style={{ ...layerBase, background: conicGradient, transform: "rotate(180deg)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease" }} />
      <div style={{ ...layerBase, background: conicGradient, filter: "blur(8px)", transform: "rotate(180deg)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease" }} />
      <div style={{
        ...layerBase,
        inset: "1px",
        background: "linear-gradient(180deg, #151A1E 0%, #0D1012 100%)",
        borderRadius: "7px",
      }} />
      <span className="btn-label" style={{
        position: "relative",
        zIndex: 1,
        color: "#F3F5F6",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}>
        {label}
      </span>
    </motion.button>
  );
}