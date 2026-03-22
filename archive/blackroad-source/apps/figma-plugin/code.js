// BlackRoad Brand System - Figma Plugin
// Provides brand colors, spacing, and components directly in Figma

const BRAND = {
  colors: {
    black: { name: 'Black', hex: '#000000', rgb: { r: 0, g: 0, b: 0 } },
    white: { name: 'White', hex: '#FFFFFF', rgb: { r: 1, g: 1, b: 1 } },
    hotPink: { name: 'Hot Pink', hex: '#FF1D6C', rgb: { r: 1, g: 0.114, b: 0.424 } },
    amber: { name: 'Amber', hex: '#F5A623', rgb: { r: 0.961, g: 0.651, b: 0.137 } },
    electricBlue: { name: 'Electric Blue', hex: '#2979FF', rgb: { r: 0.161, g: 0.475, b: 1 } },
    violet: { name: 'Violet', hex: '#9C27B0', rgb: { r: 0.612, g: 0.153, b: 0.690 } },
    orange: { name: 'Orange', hex: '#F26522', rgb: { r: 0.949, g: 0.396, b: 0.133 } },
    magenta: { name: 'Magenta', hex: '#E91E63', rgb: { r: 0.914, g: 0.118, b: 0.388 } },
    skyBlue: { name: 'Sky Blue', hex: '#448AFF', rgb: { r: 0.267, g: 0.541, b: 1 } },
    deepPurple: { name: 'Deep Purple', hex: '#5E35B1', rgb: { r: 0.369, g: 0.208, b: 0.694 } }
  },
  spacing: {
    xs: 8,
    sm: 13,
    md: 21,
    lg: 34,
    xl: 55,
    '2xl': 89,
    '3xl': 144
  },
  typography: {
    fontFamily: 'SF Pro Display',
    lineHeight: 1.618
  }
};

// Show UI
figma.showUI(__html__, { width: 400, height: 600 });

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'apply-color') {
    const { colorKey } = msg;
    const color = BRAND.colors[colorKey];

    if (!color) {
      figma.notify('❌ Color not found');
      return;
    }

    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify('⚠️  Please select an object first');
      return;
    }

    for (const node of selection) {
      if ('fills' in node) {
        const fills = [{
          type: 'SOLID',
          color: color.rgb
        }];
        node.fills = fills;
      }
    }

    figma.notify(`✅ Applied ${color.name} (${color.hex})`);
  }

  else if (msg.type === 'create-color-palette') {
    const frame = figma.createFrame();
    frame.name = 'BlackRoad Brand Colors';
    frame.resize(800, 600);
    frame.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

    let x = 34;
    let y = 34;

    // Title
    const title = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    title.characters = '🌌 BlackRoad Brand Colors';
    title.fontSize = 34;
    title.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    title.x = x;
    title.y = y;
    frame.appendChild(title);

    y += 89;

    // Primary colors
    const primaryColors = ['hotPink', 'amber', 'electricBlue', 'violet'];

    for (const colorKey of primaryColors) {
      const color = BRAND.colors[colorKey];

      // Color swatch
      const rect = figma.createRectangle();
      rect.resize(144, 89);
      rect.fills = [{ type: 'SOLID', color: color.rgb }];
      rect.cornerRadius = 13;
      rect.x = x;
      rect.y = y;
      frame.appendChild(rect);

      // Color name
      const label = figma.createText();
      label.characters = `${color.name}\n${color.hex}`;
      label.fontSize = 13;
      label.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      label.x = x + 144 + 21;
      label.y = y + 21;
      frame.appendChild(label);

      x += 144 + 144 + 34;
      if (x > 600) {
        x = 34;
        y += 89 + 21;
      }
    }

    figma.currentPage.appendChild(frame);
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);

    figma.notify('✅ Created brand color palette');
  }

  else if (msg.type === 'create-gradient') {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify('⚠️  Please select an object first');
      return;
    }

    // Create brand gradient (135deg with Golden Ratio stops)
    const gradient = {
      type: 'GRADIENT_LINEAR',
      gradientTransform: [
        [0.707, -0.707, 0.707],
        [0.707, 0.707, 0]
      ],
      gradientStops: [
        { position: 0, color: BRAND.colors.amber.rgb },
        { position: 0.382, color: BRAND.colors.hotPink.rgb },
        { position: 0.618, color: BRAND.colors.violet.rgb },
        { position: 1, color: BRAND.colors.electricBlue.rgb }
      ]
    };

    for (const node of selection) {
      if ('fills' in node) {
        node.fills = [gradient];
      }
    }

    figma.notify('✅ Applied brand gradient (Golden Ratio stops: 38.2%, 61.8%)');
  }

  else if (msg.type === 'create-spacing-guide') {
    const frame = figma.createFrame();
    frame.name = 'BlackRoad Spacing Guide (Golden Ratio)';
    frame.resize(1000, 800);
    frame.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });

    let y = 34;

    // Title
    const title = figma.createText();
    title.characters = '📐 BlackRoad Spacing (Fibonacci/Golden Ratio)';
    title.fontSize = 34;
    title.fontName = { family: "Inter", style: "Bold" };
    title.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    title.x = 34;
    title.y = y;
    frame.appendChild(title);

    y += 89;

    // Create spacing examples
    const spacingKeys = Object.keys(BRAND.spacing);

    for (const key of spacingKeys) {
      const value = BRAND.spacing[key];

      // Spacing bar
      const bar = figma.createRectangle();
      bar.resize(value, 34);
      bar.fills = [{
        type: 'GRADIENT_LINEAR',
        gradientTransform: [[1, 0, 0], [0, 1, 0]],
        gradientStops: [
          { position: 0, color: BRAND.colors.amber.rgb },
          { position: 0.382, color: BRAND.colors.hotPink.rgb },
          { position: 0.618, color: BRAND.colors.violet.rgb },
          { position: 1, color: BRAND.colors.electricBlue.rgb }
        ]
      }];
      bar.cornerRadius = 8;
      bar.x = 34;
      bar.y = y;
      frame.appendChild(bar);

      // Label
      const label = figma.createText();
      label.characters = `--space-${key}: ${value}px`;
      label.fontSize = 18;
      label.fontName = { family: "Inter", style: "Regular" };
      label.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      label.x = 34 + value + 21;
      label.y = y + 8;
      frame.appendChild(label);

      y += 55;
    }

    figma.currentPage.appendChild(frame);
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);

    figma.notify('✅ Created spacing guide');
  }

  else if (msg.type === 'create-logo') {
    // Create BlackRoad logo
    const frame = figma.createFrame();
    frame.name = 'BlackRoad Logo';
    frame.resize(200, 200);
    frame.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

    // Outer circle (hot pink)
    const outerCircle = figma.createEllipse();
    outerCircle.resize(176, 176);
    outerCircle.x = 12;
    outerCircle.y = 12;
    outerCircle.fills = [];
    outerCircle.strokes = [{ type: 'SOLID', color: BRAND.colors.hotPink.rgb }];
    outerCircle.strokeWeight = 12;
    frame.appendChild(outerCircle);

    // Top half (amber)
    const topHalf = figma.createEllipse();
    topHalf.resize(160, 160);
    topHalf.x = 20;
    topHalf.y = 20;
    topHalf.fills = [{ type: 'SOLID', color: BRAND.colors.amber.rgb }];

    // Clip to top half
    const topMask = figma.createRectangle();
    topMask.resize(160, 80);
    topMask.x = 20;
    topMask.y = 20;
    topMask.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

    const topGroup = figma.group([topHalf, topMask], frame);
    topGroup.clipsContent = true;

    // Bottom half (electric blue)
    const bottomHalf = figma.createEllipse();
    bottomHalf.resize(160, 160);
    bottomHalf.x = 20;
    bottomHalf.y = 20;
    bottomHalf.fills = [{ type: 'SOLID', color: BRAND.colors.electricBlue.rgb }];

    const bottomMask = figma.createRectangle();
    bottomMask.resize(160, 80);
    bottomMask.x = 20;
    bottomMask.y = 100;
    bottomMask.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

    const bottomGroup = figma.group([bottomHalf, bottomMask], frame);
    bottomGroup.clipsContent = true;

    // Center circle (black)
    const centerCircle = figma.createEllipse();
    centerCircle.resize(56, 56);
    centerCircle.x = 72;
    centerCircle.y = 72;
    centerCircle.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    frame.appendChild(centerCircle);

    figma.currentPage.appendChild(frame);
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);

    figma.notify('✅ Created BlackRoad logo');
  }

  else if (msg.type === 'create-component-library') {
    // Create complete component library
    const page = figma.createPage();
    page.name = '🌌 BlackRoad Brand Components';
    figma.currentPage = page;

    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });

    let x = 0;
    let y = 0;

    // Section 1: Colors
    const colorsFrame = figma.createFrame();
    colorsFrame.name = 'Colors';
    colorsFrame.resize(400, 300);
    colorsFrame.x = x;
    colorsFrame.y = y;
    colorsFrame.fills = [{ type: 'SOLID', color: { r: 0.05, g: 0.05, b: 0.05 } }];
    page.appendChild(colorsFrame);

    // Section 2: Spacing
    x += 450;
    const spacingFrame = figma.createFrame();
    spacingFrame.name = 'Spacing';
    spacingFrame.resize(400, 300);
    spacingFrame.x = x;
    spacingFrame.y = y;
    spacingFrame.fills = [{ type: 'SOLID', color: { r: 0.05, g: 0.05, b: 0.05 } }];
    page.appendChild(spacingFrame);

    // Section 3: Logo
    x += 450;
    const logoFrame = figma.createFrame();
    logoFrame.name = 'Logo';
    logoFrame.resize(400, 300);
    logoFrame.x = x;
    logoFrame.y = y;
    logoFrame.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    page.appendChild(logoFrame);

    figma.notify('✅ Created component library page');
  }

  else if (msg.type === 'get-brand-data') {
    figma.ui.postMessage({
      type: 'brand-data',
      data: BRAND
    });
  }

  else if (msg.type === 'close') {
    figma.closePlugin();
  }
};
