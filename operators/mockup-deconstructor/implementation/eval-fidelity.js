import { config as loadEnv } from 'dotenv';
import fs from 'fs';
import OpenAI from 'openai';

loadEnv({ path: '/Users/renaldoedmondson/Projects/sorted/operators/mockup-deconstructor/implementation/.env' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const mockupPath = process.argv[2] || '/Users/renaldoedmondson/Projects/sorted/mockup-inspiration/salon108.png';
const sitePath = process.argv[3] || '/tmp/salon108-site.png';

const mockupBase64 = fs.readFileSync(mockupPath).toString('base64');
const siteBase64 = fs.readFileSync(sitePath).toString('base64');

const prompt = `
You are an expert UI/UX examiner and visual fidelity evaluator.

Compare the two images: Image 1 is the original mockup (target design). Image 2 is the built website output.

Evaluate the built output against the mockup and provide two scores:
1. **Fidelity Score** (0-100): How closely the built site matches the mockup visually — layout, colors, typography, spacing, imagery, copy, CTAs, and overall structure.
2. **Examiner Score** (0-100): Quality of the build itself — code correctness, text readability, design polish, responsiveness, and whether the site looks production-ready and professional.

For each score, explain briefly (3-5 bullet points) what is correct and what is missing or wrong.

Return ONLY a JSON object in this format:
{
  "fidelity_score": <number>,
  "examiner_score": <number>,
  "fidelity_notes": [<string>],
  "examiner_notes": [<string>],
  "top_issues": [<string>]
}
`;

const response = await openai.chat.completions.create({
  model: 'gpt-4.1',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${mockupBase64}` } },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${siteBase64}` } }
      ]
    }
  ],
  max_tokens: 2000
});

const text = response.choices[0].message.content;
console.log(text);

const match = text.match(/\{[\s\S]*\}/);
if (match) {
  const result = JSON.parse(match[0]);
  console.log('\n--- Parsed Result ---');
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log('\nNo JSON found in response.');
}
