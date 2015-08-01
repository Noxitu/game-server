
module.exports = {
};

module.exports.info = {
  title: "The Great Escape",
  logo: "logo.jpg",
  hidden: true, 
  players: [2, 3, 4],
  settings: [
    {
      name: 'size',
      label: 'Rozmiar planszy',
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
      options: ['first', 'last'],
      options_labels: ['Pierwsze miejsce znane', 'Ostatnie miejsce znane']
    }
  ]
}