import { fetch } from './api.js'
import { projectName } from './project.js'
import { isFetchAll } from './settings.js'
import state from './state.js'

let shiftKeyPressed = false
window.addEventListener('keydown', (e) => {
  if (e.shiftKey) {
    shiftKeyPressed = true
  }
})
window.addEventListener('keyup', () => {
  shiftKeyPressed = false
})

export const updateConditions = () => document.hasFocus() && !shiftKeyPressed

/**
 * @argument {string} message
 * @argument {Dash.Config} config
 */
export const setMetaTitle = (message, config) => (meta_title.textContent = `${config.TITLE ?? 'dash'} · ${message}`)

/**
 * @argument {Function} template
 * @argument {Dash.Config} config
 */
export const update = (template, config) => {
  fetch(isFetchAll() ? 'containers-all' : 'containers')
  fetch('networks')

  const projects = Array.from(state.containers.reduce((acc, c) => acc.add(projectName(c)), new Set()))

  /** @type {Record<string, Dash.Container[]>} */
  const containersInit = {}

  /** @type {Record<string, Dash.Network[]>} */
  const networksInit = {}

  const data = {
    containers: state.containers.reduce(mapByProject, containersInit),
    networks: state.networks.reduce(mapByProject, networksInit),
  }

  setMetaTitle(`${state.containers.length} services`, config)

  requestAnimationFrame(() => {
    render.innerHTML = template(projects, data)
  })
}

/**
 * @template {Dash.Labelled} T
 * @argument {Record<string, T[]>} acc
 * @argument {T} current
 */
const mapByProject = (acc, current) => {
  const project = projectName(current)
  return { ...acc, [project]: [...(acc[project] || []), current] }
}
