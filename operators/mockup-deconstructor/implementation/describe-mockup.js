import { config as loadEnv } from 'dotenv';
import fs from 'fs';
import OpenAI from 'openai';

loadEnv({ path: '/Users/renaldoedmondson/Projects/sorted/operators/mockup-deconstructor/implementation/.env' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const mockupPath = process.argv[2] || '/Users/renaldoedmondson/Projects/sorted/mockup-inspiration/salon108.png';
const mockupBase64 = fs.readFileSync(mockupPath).toString('base64');

const prompt = `
You are an expert UI/UX designer. Describe this website mockup in detail for a developer to implement pixel-perfectly. Focus on:

1. Overall layout and section order (top to bottom)
2. Approximate pixel heights and positions of each section (the mockup is 877x1794 pixels)
3. Typography: fonts, weights, sizes, uppercase/lowercase, letter spacing, colors
4. Colors: background colors, accent colors, text colors
5. Images: positions, sizes, aspect ratios, cropping
6. Buttons and CTAs: style, color, size, text, position
7. Navigation: layout, items, logo, hamburger or links
8. Icons: style, color, size
9. Spacing: padding, margins, gaps
10. Any unique visual elements: lines, shapes, shadows, gradients, cards

Be precise and quantitative where possible. Output as a structured list/sections.
`;

const response = await openai.chat.completions.create({
  model: 'gpt-4.1',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${mockupBase64}` } }
      ]
    }
  ],
  max_tokens: 3000
});

console.log(response.choices[0].message.content);
