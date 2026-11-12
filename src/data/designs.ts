/** Every Kadha design that has a finished stitch file and a public image. */
export type Design = { id: string; name: string; theme: string }

export const designs: Design[] = [
  { id: 'adam', name: 'The Creation of Adam', theme: 'Masterpieces' },
  { id: 'kali', name: 'Bhadrakali', theme: 'Gods and epics' },
  { id: 'shiva', name: 'Shiva', theme: 'Gods and epics' },
  { id: 'jatayu', name: 'Jatayu', theme: 'Gods and epics' },
  { id: 'chaathan', name: 'Chaathan', theme: 'Spirits of the night' },
  { id: 'yakshi', name: 'Yakshi', theme: 'Spirits of the night' },
  { id: 'odiyan', name: 'Odiyan', theme: 'Spirits of the night' },
  { id: 'unniyarcha', name: 'Unniyarcha', theme: 'Warriors' },
  { id: 'chandu', name: 'Chandu', theme: 'Warriors' },
  { id: 'defiance', name: 'Karnan, Napoleon, Bhagat Singh', theme: 'Warriors' },
  { id: 'wolf', name: 'Wolf', theme: 'The wild' },
  { id: 'gorilla', name: 'Gorilla', theme: 'The wild' },
  { id: 'spadikam', name: 'Spadikam', theme: 'Silver screen' },
]

export const designById = (id: string) => designs.find((d) => d.id === id) ?? designs[0]
