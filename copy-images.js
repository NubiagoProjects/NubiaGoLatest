const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Get all SVG files and copy them as JPG files
const svgFiles = fs.readdirSync(publicDir).filter(file => file.endsWith('.svg'));

svgFiles.forEach(svgFile => {
  const svgPath = path.join(publicDir, svgFile);
  const jpgFile = svgFile.replace('.svg', '.jpg');
  const jpgPath = path.join(publicDir, jpgFile);
  
  // Copy SVG content to JPG file (browsers will handle SVG content regardless of extension)
  fs.copyFileSync(svgPath, jpgPath);
  console.log(`Copied: ${svgFile} -> ${jpgFile}`);
});

console.log('All images copied with .jpg extensions!');
