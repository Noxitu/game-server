
module.exports = {};

module.exports.info = {
  title: "Labirynt",
  logo: "labirynth.jpg",
  players: 2,
  settings: [
    {
      name: 'width',
      label: 'Szerokość',
      value: 'int'
    },
    {
      name: 'height',
      label: 'Wysokość',
      value: 'int'
    },
    {
      name: 'walls',
      label: 'Ścian',
      value: 'int'
    },
    {
      name: 'end-when',
      label: 'Koniec gry',
      options: ['winner', 'loser'],
      options_labels: ['Wygrany zakończy grę', 'Przegrany zakończy grę']
    }
  ]
}