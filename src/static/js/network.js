export default {
  setup: () => {
    document.addEventListener('mouseover', (e) => {
      e.preventDefault()
      if (!(e.target instanceof HTMLElement)) {
        return
      }
      if (!e.shiftKey) {
        return
      }
      const isEligible = e.target?.classList.contains('network') || e.target?.classList.contains('service')
      if (isEligible) {
        const networkIds = e.target.dataset.network?.split('-')
        const items = render.querySelectorAll(
          networkIds?.map((id) => `.project > .card[data-network|="${id}"]`).join(', ') ?? ''
        )
        ;[...items].forEach((item) => {
          item.classList.add('is-highlighted')
          item.parentElement?.classList.add('is-highlighting')
        })
        render.classList.add('is-highlighting')
      }
    })

    document.addEventListener('mouseout', (e) => {
      e.preventDefault()
      if (!e.shiftKey) {
        return
      }
      ;[...render.querySelectorAll('.project > .card')].forEach((item) => {
        item.classList.remove('is-highlighted')
      })
      ;[...render.querySelectorAll('.project')].forEach((item) => {
        item.classList.remove('is-highlighting')
      })
      render.classList.remove('is-highlighting')
    })
  },
}
