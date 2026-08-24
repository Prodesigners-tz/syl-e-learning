// MFANO wa muundo wa benki ya maswali — bado HAIJAJAA maswali yote.
// Hizi ni sampuli chache tu kuonyesha schema sahihi. Baada ya kupitia
// na kusahihisha notes (public/content/notes/*.md), maswali kamili ya
// kila moduli yataongezwa hapa au (vizuri zaidi kwa uzalishaji) kwenye
// Firestore collection `questionBank/{moduleId}/questions`.
//
// Schema ya kila swali:
// {
//   id: string (kipekee ndani ya moduli),
//   text: string,
//   options: string[] (chaguo 4),
//   correctIndex: number (0-3),
// }

export const QUESTION_BANK_SAMPLE = {
  semina1: [
    {
      id: 'semina1-q1',
      text: 'Idara ya Vijana Waadventista inahusiana na unabii gani wa Biblia kuhusu mioyo ya baba na watoto?',
      options: ['Isaya 40', 'Malaki 4', 'Yohana 3', 'Mathayo 5'],
      correctIndex: 1,
    },
    {
      id: 'semina1-q2',
      text: 'Kwa mujibu wa muundo wa Kanisa la Waadventista, ni ipi kati ya hizi iko juu zaidi ya "Konferensi"?',
      options: ['Kanisa Mahalia', 'Unioni', 'Divisheni', 'Konferensi Kuu'],
      correctIndex: 2,
    },
    {
      id: 'semina1-q3',
      text: 'Ellen Harmon alikuwa na umri gani alipoanza kupokea njozi kutoka kwa Mungu?',
      options: ['15', '17', '21', '25'],
      correctIndex: 1,
    },
  ],
  semina2: [
    {
      id: 'semina2-q1',
      text: 'Semina ya 2 inasisitiza nini kuhusu akili ya vijana wadogo?',
      options: [
        'Imekamilika kabisa kufikia miaka 12',
        'Bado haijakamilika, hasa sehemu inayohusika na uamuzi',
        'Haihusiani na maamuzi',
        'Ni sawa na ya watu wazima',
      ],
      correctIndex: 1,
    },
  ],
}
