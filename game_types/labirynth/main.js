
module.exports = {
};

module.exports.info = {
  title: "Labirynt",
  logo: "labirynth.jpg",
  players: 2,
  hidden: true,
  settings: [
    {
      name: 'width',
      label: 'Szerokość',
      value: 'int',
      value_ex: {min: 1, 'default': 8}
    },
    {
      name: 'height',
      label: 'Wysokość',
      value: 'int',
      value_ex: {min: 1, 'default': 8}
    },
    {
      name: 'walls',
      label: 'Ścian',
      value: 'int',
      value_ex: {min: 0, 'default': 20}
    },
    {
      name: 'end-when',
      label: 'Koniec gry',
      options: ['winner', 'loser'],
      options_labels: ['Wygrany zakończy grę', 'Przegrany zakończy grę']
    }
  ]
}