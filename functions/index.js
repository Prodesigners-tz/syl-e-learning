/**
 * Cloud Functions — mfumo wa idhini ya mchungaji kwa barua pepe.
 *
 * 1. onUserCreated: kila mtu anaposajili akaunti (users/{uid} inaundwa),
 *    hii inatengeneza token ya idhini na kutuma barua pepe kwa mchungaji
 *    wa kanisa lake, yenye link ya "Idhinisha".
 *
 * 2. approveByPastor: HTTPS endpoint inayofunguliwa kutoka kwenye hiyo
 *    link. Inathibitisha token, inabadili users/{uid}.status kuwa
 *    'approved', kisha inatuma barua pepe ya arifa kwa mwanachama.
 *
 * USANIDI UNAOHITAJIKA (SMTP):
 *   firebase functions:config:set smtp.host="..." smtp.port="587" \
 *     smtp.user="..." smtp.pass="..." smtp.from="SYL <no-reply@yourdomain.org>"
 *   app.base_url="https://yourapp.web.app"
 *
 * (Tumia akaunti ya SMTP ya kutuma barua pepe — mfano SendGrid, Mailgun,
 * au akaunti ya Google Workspace ya kanisa/idara — si Gmail ya kawaida
 * ya kibinafsi, ambayo Google huizuia kwa kutuma kiotomatiki.)
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { onRequest } = require('firebase-functions/v2/https')
const { defineString } = require('firebase-functions/params')
const admin = require('firebase-admin')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

admin.initializeApp()
const db = admin.firestore()

const SMTP_HOST = defineString('SMTP_HOST')
const SMTP_PORT = defineString('SMTP_PORT')
const SMTP_USER = defineString('SMTP_USER')
const SMTP_PASS = defineString('SMTP_PASS')
const SMTP_FROM = defineString('SMTP_FROM')
const APP_BASE_URL = defineString('APP_BASE_URL')

function getTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST.value(),
    port: Number(SMTP_PORT.value() || 587),
    secure: false,
    auth: { user: SMTP_USER.value(), pass: SMTP_PASS.value() },
  })
}

exports.onUserCreated = onDocumentCreated('users/{uid}', async (event) => {
  const uid = event.params.uid
  const user = event.data.data()

  if (!user.churchId) return

  const churchSnap = await db.collection('churches').doc(user.churchId).get()
  if (!churchSnap.exists) return
  const church = churchSnap.data()

  const token = crypto.randomBytes(24).toString('hex')
  await db.collection('approvalTokens').doc(uid).set({
    token,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    used: false,
  })

  const approveUrl = `${APP_BASE_URL.value()}/pastor-approve?uid=${uid}&token=${token}`

  const transport = getTransport()
  await transport.sendMail({
    from: SMTP_FROM.value(),
    to: church.pastorEmail,
    subject: `Ombi la usajili — Kozi ya SYL (${user.name})`,
    html: `
      <p>Habari Mchungaji ${church.pastorName || ''},</p>
      <p><strong>${user.name}</strong> (${user.email}) kutoka <strong>${church.name}</strong>
      ameomba kujiunga na kozi ya <strong>Kiongozi Mwandamizi wa Vijana Wakubwa (SYL)</strong>.</p>
      <p>Tafadhali bofya link hapa chini kuidhinisha ombi lake:</p>
      <p><a href="${approveUrl}">${approveUrl}</a></p>
    `,
  })
})

exports.approveByPastor = onRequest(async (req, res) => {
  const { uid, token } = req.query
  if (!uid || !token) {
    res.status(400).send('Ombi si sahihi.')
    return
  }

  const tokenRef = db.collection('approvalTokens').doc(uid)
  const tokenSnap = await tokenRef.get()

  if (!tokenSnap.exists || tokenSnap.data().token !== token) {
    res.status(403).send('Token si sahihi au imekamilika muda wake.')
    return
  }
  if (tokenSnap.data().used) {
    res.status(200).send('Ombi hili tayari lilishaidhinishwa.')
    return
  }

  const userRef = db.collection('users').doc(uid)
  await userRef.update({ status: 'approved', approvedAt: admin.firestore.FieldValue.serverTimestamp() })
  await tokenRef.update({ used: true })

  const userSnap = await userRef.get()
  const user = userSnap.data()

  try {
    const transport = getTransport()
    await transport.sendMail({
      from: SMTP_FROM.value(),
      to: user.email,
      subject: 'Akaunti yako ya SYL imeidhinishwa',
      html: `<p>Habari ${user.name},</p><p>Akaunti yako imeidhinishwa na mchungaji wako. Sasa unaweza kuingia na kuanza kozi.</p>`,
    })
  } catch (e) {
    // Idhini bado imefanikiwa hata kama barua pepe ya arifa itashindikana.
    console.error('Failed to send confirmation email', e)
  }

  res.status(200).send('Umeidhinisha kwa mafanikio. Asante!')
})
