// Orodha ya moduli (semina) 10 za SYL, kwa mpangilio.
// `contentFile` inaelekeza kwenye faili ya notes (markdown) iliyowekwa
// /public/content/notes/ — tazama scripts/seedContent.js kwa maelezo
// ya jinsi hizi zinavyotolewa kutoka kwenye manual asili.

export const MODULES = [
  {
    id: 'semina1',
    order: 1,
    title: 'Utangulizi wa Huduma za Vijana',
    subtitle: 'Kuelewa Historia, Falsafa, Njozi, Malengo na Muundo wa Huduma za Vijana Waadventista',
    contentFile: '01_semina1_utangulizi_huduma_za_vijana.md',
    passMark: 75,
  },
  {
    id: 'semina2',
    order: 2,
    title: 'Maendeleo ya Kijana',
    subtitle: 'Kumfahamu Kijana',
    contentFile: '02_semina2_maendeleo_ya_kijana.md',
    passMark: 75,
  },
  {
    id: 'semina3',
    order: 3,
    title: 'Masuala ya Sasa',
    subtitle: 'Hitaji la Huduma Maalum ya Vijana',
    contentFile: '03_semina3_masuala_ya_sasa.md',
    passMark: 75,
  },
  {
    id: 'semina4',
    order: 4,
    title: 'Uongozi',
    subtitle: 'Kiongozi Mwandamizi wa Vijana kama Kiongozi wa Kiroho',
    contentFile: '04_semina4_uongozi.md',
    passMark: 75,
  },
  {
    id: 'semina5',
    order: 5,
    title: 'Unasihi',
    subtitle: 'Umiliki na Uwezeshwaji katika Huduma za Vijana',
    contentFile: '05_semina5_unasihi.md',
    passMark: 75,
  },
  {
    id: 'semina6',
    order: 6,
    title: 'Upangaji wa Kanisa',
    subtitle: 'Kujenga Mfumo Unaoongozwa na Madhumuni wa Huduma za Vijana katika Kanisa Mahalia',
    contentFile: '06_semina6_upangaji_wa_kanisa.md',
    passMark: 75,
  },
  {
    id: 'semina7',
    order: 7,
    title: 'Huduma ya Vijana Yenye Ubunifu',
    subtitle: 'Kufikiri Nje ya Kasha',
    contentFile: '07_semina7_huduma_yenye_ubunifu.md',
    passMark: 75,
  },
  {
    id: 'semina8',
    order: 8,
    title: 'Kutoa Huduma',
    subtitle: 'Kukirimiwa Kiroho na Utumishi',
    contentFile: '08_semina8_kutoa_huduma.md',
    passMark: 75,
  },
  {
    id: 'semina9',
    order: 9,
    title: 'Ushuhudiaji wa Vijana',
    subtitle: 'Uinjilisti Kwa Wote',
    contentFile: '09_semina9_ushuhudiaji_wa_vijana.md',
    passMark: 75,
  },
  {
    id: 'semina10',
    order: 10,
    title: 'Uinjilisti wa Kidijitali',
    subtitle: 'Kutumia Vizuri Fursa Zinazotolewa na Mitandao ya Kijamii Huku Tukiepuka Hatari Zake',
    contentFile: '10_semina10_uinjilisti_wa_kidijitali.md',
    passMark: 75,
  },
]

export function getModuleById(id) {
  return MODULES.find((m) => m.id === id)
}

export function getNextModule(currentId) {
  const idx = MODULES.findIndex((m) => m.id === currentId)
  return MODULES[idx + 1] || null
}
