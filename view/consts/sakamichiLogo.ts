type Logo = {
 name: string,
 url: string
}

export const sakamichiLogo: Logo[] = [
  { name: 'nogizaka', url: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Nogizaka46_logo.svg' },
  { name: 'sakurazaka', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Sakurazaka46_logo.svg' },
  { name: 'hinatazaka', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Hinatazaka46_logo.svg' },
]

export const LogoNavigator = (() => {
  let currentIndex = 0

  return {
    current: () => sakamichiLogo[currentIndex],
    next: () => {
      currentIndex = (currentIndex + 1) % sakamichiLogo.length
      return sakamichiLogo[currentIndex]
    },
    reset: () => {
      currentIndex = 0
    }
  }
})()
