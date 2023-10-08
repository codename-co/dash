/** @type {Record<string, {hex: string; path: string; svg: string}>} */
let simpleIcons

export default {
  setup: async () => {
    // @ts-ignore
    simpleIcons = await import('https://cdn.jsdelivr.net/npm/simple-icons@9.17/+esm')
  },

  /** @argument {string} slug */
  get: (slug = 'docker') => {
    const normalizedSlug = slug.toLowerCase().replaceAll(' ', 'plus').replaceAll('+', 'plus').replaceAll('.', 'dot')
    const iconKey = `si${normalizedSlug.charAt(0).toUpperCase()}${normalizedSlug.slice(1)}`

    const icon = simpleIcons?.[iconKey] ?? simpleIcons?.siDocker

    return `<span style="fill:#${icon?.hex}">${icon?.svg ?? ''}</span>`
  },
}
