/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "var(--accent)",
        background: "var(--bg)",
        soft: "var(--bg-soft)",
        tint: "var(--bg-tint)",
        tintAlt: "var(--bg-tint-alt)",
        surface: "var(--surface)",
        panel: "var(--panel)",
        text: "var(--text)",
        muted: "var(--muted)",
        line: "var(--line)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem",
        34: "8.5rem",
      },
      borderRadius: {
        soft: "18px",
        card: "24px",
        pill: "999px",
      },
      boxShadow: {
        float: "0 12px 24px rgba(15, 23, 42, 0.05)",
        floatHover: "0 18px 32px rgba(15, 23, 42, 0.08)",
        card: "0 16px 34px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
