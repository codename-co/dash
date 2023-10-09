import { fetchConfig, fetchContainers, fetchNetworks } from './api.js'
import icons from './icons.js'
import network from './network.js'
import { projectName } from './project.js'
import search from './search.js'
import { serviceIconName, serviceLinks, serviceName, serviceNetworks, serviceStatus, serviceTech } from './service.js'
import settings, { isFetchAll } from './settings.js'

/**
 * @template {Dash.Labelled} T
 * @argument {Record<string, T[]>} acc
 * @argument {T} current
 */
const mapByProject = (acc, current) => {
  const project = projectName(current)
  return { ...acc, [project]: [...(acc[project] || []), current] }
}

const update = async () => {
  const [containersState, networksState] = await Promise.all([fetchContainers(isFetchAll()), fetchNetworks()])

  const projects = Array.from(containersState.reduce((acc, c) => acc.add(projectName(c)), new Set()))

  /** @type {Record<string, Dash.Container[]>} */
  const containersInit = {}

  /** @type {Record<string, Dash.Network[]>} */
  const networksInit = {}

  const data = {
    containers: containersState.reduce(mapByProject, containersInit),
    networks: networksState.reduce(mapByProject, networksInit),
  }

  console.debug(data)

  meta_title.textContent = `${config.TITLE ?? 'dash'} · ${containersState.length} services`

  requestAnimationFrame(() => {
    render.innerHTML = `
      ${projects
        // .sort(sortStrings)
        .map(
          (project) => `
            <div class="project">
              <h3>${project}</h3>
              ${data.containers[project]
                .sort((a, b) => sortStrings(serviceName(a), serviceName(b)))
                .filter(filteredContainers)
                .map((c) => {
                  const link = serviceLinks(c)?.[0]
                  return `
                    <a class="card service" data-network="${serviceNetworks(c)
                      .map((network) => network.NetworkID)
                      .join('-')}" ${link?.url ? `href="${link?.url}"` : ''} target="_blank">
                      <span class="icon">
                        ${icons.get(serviceIconName(c))}
                      </span>
                      <span class="name">
                        ${serviceName(c)}
                      </span>
                      <span class="status">
                        ${serviceStatus(c)}
                      </span>
                      <span class="image is-small">
                        ${serviceTech(c)}
                      </span>
                      <span class="links is-small">
                        ${serviceLinks(c)
                          .map((link) => `<span class="link">${link.label}</span>`)
                          .join('&nbsp;')}
                      </span>
                      <!--
                      <span class="networks is-small">
                        ${serviceNetworks(c)
                          .map((network) => network.name)
                          .join('&nbsp;')}
                      </span>
                      -->
                    </a>
                  `
                })
                .join('')}
              ${data.networks[project]
                ?.sort((a, b) => sortStrings(a.Name, b.Name))
                // .filter(filteredContainers)
                .map(
                  (n) => `
                    <span class="card network" data-network="${n.Id}">
                      <span class="name is-small">
                        ${n.Name.replace(new RegExp(`^${project}_`), '')} network
                      </span>
                      <!--
                      <span class="status is-small">
                        ${n.Id.substring(0, 8)}
                      </span>
                      -->
                    </span>
                  `
                )
                .join('')}
            </div>
          `
        )
        .join('')}
    `
  })
}

/** @argument {Dash.Container} c */
const filteredContainers = (c) =>
  !filters.search || serviceName(c).includes(filters.search) || c.Image.includes(filters.search)

/**
 * @argument {string} stra
 * @argument {string} strb
 */
const sortStrings = (stra, strb) => {
  const a = stra.toUpperCase()
  const b = strb.toUpperCase()

  return a < b ? -1 : a > b ? 1 : 0
}

/** @type {Dash.Filters} */
const filters = {
  search: '',
}

update()

search.setup(filters, update)
settings.setup(update)
network.setup()

const config = await fetchConfig()
console.log(config)
settings.setTheme(config.THEME)
settings.setTitle(config.TITLE)
icons.setup().then(update)

setInterval(() => {
  if (document.hasFocus()) {
    update()
  }
}, config.UPDATE_INTERVAL ?? 1000)
