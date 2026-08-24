/**
 * Script ya mara moja: inatengeneza (au kusahihisha) akaunti ya ADMIN
 * moja kwa moja, bila hatari ya makosa ya kubofya-bofya kwenye Firebase
 * Console.
 *
 * JINSI YA KUTUMIA:
 * 1. Firebase Console -> Project Settings (gia) -> Service accounts
 * 2. Bofya "Generate new private key" -> itapakua faili ya JSON
 * 3. Ibadilishe jina faili hiyo kuwa: serviceAccountKey.json
 * 4. Iweke ndani ya folder hii (scripts/serviceAccountKey.json)
 * 5. Kwenye terminal (ndani ya folder kuu ya project):
 *      npm install firebase-admin --save-dev
 *      node scripts/setupAdmin.js
 */

const admin = require('firebase-admin')
const path = require('path')

const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const ADMIN_EMAIL = 'davidpanga115@gmail.com'
const ADMIN_NAME = 'David Panga'

async function main() {
  // Tafuta mtumiaji kwa email (lazima awe tayari ameshaundwa
  // Authentication -> Users, kama ulivyoshafanya)
  const userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL)
  console.log('Nimempata mtumiaji, UID:', userRecord.uid)

  const db = admin.firestore()
  await db.collection('users').doc(userRecord.uid).set(
    {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: 'admin',
      status: 'approved',
    },
    { merge: true }
  )

  console.log('DONE! Document sahihi imetengenezwa kwenye users/' + userRecord.uid)
  console.log('Sasa unaweza kuingia (login) na akaunti hii kama admin.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Kuna tatizo:', err.message)
    process.exit(1)
  })
