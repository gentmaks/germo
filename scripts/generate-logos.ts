import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function generateLogos() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const logoHTML = `
    <html>
      <body style="margin: 0; padding: 0;">
        <div id="logo"></div>
        <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
        <script>
          const Logo = ({ size = 40, color = '#2563eb' }) => {
            return React.createElement('svg', {
              width: size,
              height: size,
              viewBox: '0 0 100 100',
              fill: 'none',
              xmlns: 'http://www.w3.org/2000/svg'
            }, [
              React.createElement('circle', {
                cx: 50,
                cy: 50,
                r: 45,
                fill: color
              }),
              React.createElement('text', {
                x: 50,
                y: 65,
                fontFamily: 'Arial, sans-serif',
                fontSize: 45,
                fontWeight: 'bold',
                fill: 'white',
                textAnchor: 'middle'
              }, 'G'),
              React.createElement('path', {
                d: 'M30 70 L70 70',
                stroke: 'white',
                strokeWidth: 4,
                strokeLinecap: 'round'
              })
            ]);
          };

          ReactDOM.render(
            React.createElement(Logo, { size: LOGO_SIZE }),
            document.getElementById('logo')
          );
        </script>
      </body>
    </html>
  `;

  const sizes = [
    { name: 'logo', size: 192 },
    { name: 'android-chrome-512x512', size: 512 }
  ];

  for (const { name, size } of sizes) {
    const html = logoHTML.replace('LOGO_SIZE', size.toString());
    await page.setContent(html);
    await page.setViewport({ width: size, height: size });

    const logoElement = await page.$('#logo');
    if (!logoElement) continue;

    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    const outputPath = path.join(publicDir, `${name}.png`) as `${string}.png`;
    await logoElement.screenshot({
      path: outputPath,
      omitBackground: true
    });
  }

  await browser.close();
  console.log('Logo files generated successfully!');
}

generateLogos().catch(console.error); 