const fs = require('fs');
let content = fs.readFileSync('next.config.ts', 'utf8');

const headersCode = `
  async headers() {
    return [
      {
        source: "/(.*).mobileconfig",
        headers: [
          {
            key: "Content-Type",
            value: "application/x-apple-aspen-config",
          },
        ],
      },
    ];
  },
`;

if (!content.includes('headers()')) {
    content = content.replace(
        /images:\s*\{[\s\S]*?\},/,
        match => match + '\n' + headersCode
    );
    fs.writeFileSync('next.config.ts', content, 'utf8');
    console.log('Added headers to next.config.ts');
}