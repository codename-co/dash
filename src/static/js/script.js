import { fetchConfig } from './api.js'
import icons from './icons.js'
import network from './network.js'
import { update as renderUpdate, updateConditions } from './render.js'
import search from './search.js'
import {
  serviceDescription,
  serviceEnabled,
  serviceIconName,
  serviceLinks,
  serviceName,
  serviceNetworks,
  serviceStatus,
  serviceTech,
} from './service.js'
import settings from './settings.js'

/**
 * @argument {string[]} projects]
 * @argument {{ containers: Record<string, Dash.Container[]>; networks: Record<string, Dash.Network[]>}} data
 */
const appTemplate = (projects, data) =>
  projects
    // .sort(sortStrings)
    .map(
      (project) => `
      <div class="project">
        <h3>${project}</h3>
        ${data.containers[project]
          .sort((a, b) => sortStrings(serviceName(a), serviceName(b)))
          .filter(serviceEnabled)
          .filter(filteredContainers)
          .map((c) => {
            const link = serviceLinks(c)?.[0]
            const desc = serviceDescription(c)

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
                ${
                  desc
                    ? `
                <span class="desc is-small">
                  ${desc}
                </span>
                      `
                    : ''
                }
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
    .join('')

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

renderUpdate(appTemplate, {})

const config = await fetchConfig()
console.log(config)
const update = () => renderUpdate(appTemplate, config)
search.setup(filters, update)
settings.setup(update)
network.setup()
settings.setTheme(config.THEME)
settings.setTitle(config.TITLE)
icons.setup().then(update)

setInterval(() => {
  if (updateConditions()) {
    update()
  }
}, config.UPDATE_INTERVAL ?? 1000)
