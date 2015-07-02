

module.exports = {
  title: "Labirynt",
  logo: "logo.jpg",
  players: 2,
  settings: [
    {
      name: 'width',
      title: 'Szeroko��',
      value: 'int'
    },
    {
      name: 'height',
      title: 'Wysoko��',
      value: 'int'
    },
    {
      name: 'walls',
      title: '�cian',
      value: 'int'
    },
    {
      name: 'end-when',
      title: 'Koniec gry',
      options: ['winner', 'loser'],
      options_titles: ['Wygrany zako�czy gr�', 'Przegrany zako�czy gr�']
    }
  ]
}