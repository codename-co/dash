export const isFetchAll = () => sessionStorage.getItem('all') === 'true'

export const setFetchAll = async (value = !isFetchAll()) => sessionStorage.setItem('all', String(value))

export default {
  /**
   * @param {function} update
   * @param {Dash.Config} config
   */
  setup: (update, config) => {
    toggleAll.addEventListener('click', async () => {
      await setFetchAll()
      update()
    })
    toggleAll.checked = isFetchAll()

    setTheme(config.THEME)
    setTitle(config.TITLE)
  },
}

/** @argument {string | undefined} theme */
const setTheme = (theme = 'rainbow') => {
  if (!theme) {
    return
  }

  document.querySelector('html')?.setAttribute('data-theme', theme)
}

/** @argument {string | undefined} title */
const setTitle = (title) => {
  if (!title) {
    return
  }

  globalThis.title.innerText = title
}
