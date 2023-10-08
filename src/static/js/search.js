export default {
  /**
   * @param {Dash.Filters} filters
   * @param {function} update
   */
  setup: (filters, update) => {
    const event = new Event('searching')

    search.addEventListener('searching', () => {
      filters.search = search.value
      update()
    })

    search.addEventListener('keydown', async (e) => {
      if (e.key === 'Backspace' || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        // search.value = ''
      } else {
        e.preventDefault()
      }
      search.dispatchEvent(event)
    })

    window.addEventListener('keydown', async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
        search.value = ''
      } else if (e.key === 'Backspace') {
        search.value = search.value.slice(0, -1)
      } else if (e.altKey || e.ctrlKey || e.metaKey) {
        return
      } else if (e.code === 'Space') {
        return
      } else if (e.key.length > 1) {
        return
      } else {
        search.value = `${search.value ?? ''}${e.key}`
      }
      search.dispatchEvent(event)
    })
  },
}
