// Brand palette from Alexa's message — saved for reference
// Six chromatic stops: Ember, Flare, Magenta, Orchid, Arc, Cyan
// See full component in conversation history
export const CHROMATIC_STOPS = [
  { name: "Ember",   hex: "#FF6B2B", label: "Warm anchor" },
  { name: "Flare",   hex: "#FF2255", label: "Hot energy" },
  { name: "Magenta", hex: "#CC00AA", label: "Bold pivot" },
  { name: "Orchid",  hex: "#8844FF", label: "Depth" },
  { name: "Arc",     hex: "#4488FF", label: "Cool tension" },
  { name: "Cyan",    hex: "#00D4FF", label: "Cool edge" },
];

export const GRADIENTS = {
  full: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)",
  warmCool: "linear-gradient(90deg, #FF6B2B, #FF2255, #8844FF, #4488FF)",
  fire: "linear-gradient(90deg, #FF6B2B, #FF2255)",
  violet: "linear-gradient(90deg, #CC00AA, #8844FF)",
  arc: "linear-gradient(90deg, #4488FF, #00D4FF)",
};

export const GRAYSCALE = {
  950: "#0a0a0a",  // Deep Black
  900: "#171717",  // Surface
  800: "#262626",  // Card
  700: "#404040",  // Border Active
  500: "#737373",  // Placeholder
  300: "#d4d4d4",  // Label
  100: "#f5f5f5",  // Foreground
};
