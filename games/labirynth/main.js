

module.exports = {
  title: "Labirynt",
  logo: "logo.jpg",
  players: 2,
  settings: [
    {
      name: 'width',
      title: 'Szerokoœæ',
      value: 'int'
    },
    {
      name: 'height',
      title: 'Wysokoœæ',
      value: 'int'
    },
    {
      name: 'walls',
      title: 'Œcian',
      value: 'int'
    },
    {
      name: 'end-when',
      title: 'Koniec gry',
      options: ['winner', 'loser'],
      options_titles: ['Wygrany zakoñczy grê', 'Przegrany zakoñczy grê']
    }
  ]
}