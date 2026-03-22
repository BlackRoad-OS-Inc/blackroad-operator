// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

let canvas: HTMLCanvasElement | undefined = undefined;

function get_context() {
  if (canvas == undefined) {
    canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
  }
  return canvas.getContext("2d")!;
}

export interface Label {
  text: string;
  fontFamily?: string;
  fontSize?: number;
  lineSpacing?: number;
}

export function measureText(label: Label): { width: number; height: number } {
  let ctx = get_context();
  ctx.font = `${label.fontSize ?? 10}px ${label.fontFamily ?? "system-ui"}`;
  let widths = label.text.split("\n").map((l) => ctx.measureText(l).width);
  let lineHeight = (label.fontSize ?? 10) * (label.lineSpacing ?? 1);
  let height = lineHeight * widths.length;
  let width = widths.reduce((a, b) => Math.max(a, b));
  return {
    width: width,
    height: height,
  };
}
