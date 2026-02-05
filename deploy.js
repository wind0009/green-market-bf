import fs from 'fs';
import path from 'path';

console.log('🚀 Déploiement simplifié de Green Market App');
console.log('📁 Vérification du dossier dist...');

if (fs.existsSync('./dist')) {
  console.log('✅ Dossier dist trouvé');
  
  const files = fs.readdirSync('./dist');
  console.log('📋 Fichiers dans dist:', files);
  
  console.log('\n🌐 Instructions de déploiement manuel:');
  console.log('1. Option 1: Uploadez le dossier dist/ sur Netlify.com (glisser-déposer)');
  console.log('2. Option 2: Uploadez sur Vercel.com');
  console.log('3. Option 3: Uploadez sur GitHub Pages');
  console.log('4. Option 4: Utilisez n\'importe quel hébergeur statique');
  
  console.log('\n📝 Pour Firebase Hosting:');
  console.log('- Allez sur https://console.firebase.google.com');
  console.log('- Créez un nouveau projet');
  console.log('- Activez Firebase Hosting');
  console.log('- Uploadez le contenu du dossier dist/');
  
} else {
  console.log('❌ Dossier dist non trouvé. Lancez: npm run build');
}
