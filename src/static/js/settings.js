export const isFetchAll = () => sessionStorage.getItem('all') === 'true'

export const setFetchAll = async (value = !isFetchAll()) => sessionStorage.setItem('all', String(value))

export default {
  /** @param {function} update */
  setup: (update) => {
    toggleAll.addEventListener('click', async () => {
      await setFetchAll()
      update()
    })
    toggleAll.checked = isFetchAll()
  },

  /** @argument {string | undefined} theme */
  setTheme: (theme = 'rainbow') => {
    if (!theme) {
      return
    }

    document.querySelector('html')?.setAttribute('data-theme', theme)
  },

  /** @argument {string | undefined} title */
  setTitle: (title) => {
    if (!title) {
      return
    }

    globalThis.title.innerText = title
  },
}
