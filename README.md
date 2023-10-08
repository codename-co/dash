# Dash

`dash` is a drop-in minimalist Docker dashboard with services auto-discovery.

![dash screenshot](./docs/dash-home-1.webp)

## Features

- 🐳 **Automatic** Docker services discovery
- ⚡ Blazing-**fast**
- 🪶 **Light** Docker image (~10MB)
- 🛡️ **Robust** typed codebase
- 🟢 Service status
- 🔍 **Search** services by name, image
- 🔄 **Responsive** user interface
- 💄 **Themable**
- 🔧 **Customizable**

## Getting started

### Global discovery

Run dash globally and discover services from all projects.

From the terminal:

```shell
docker run -it --rm -p 80:80 -v /var/run/docker.sock:/var/run/docker.sock codename/dash
```

Then go to <http://localhost>.

### Local discovery

Run dash for a dedicated project.

From the terminal:

```shell
docker run -it --rm -p 80:80 -v /var/run/docker.sock:/var/run/docker.sock -e PROJECT=myproject codename/dash
```

Then go to <http://localhost>.

From a compose file:

```yaml
services:
  dash:
    image: codename/dash
    ports:
      - 80:80
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      PROJECT: myproject
```

```shell
docker compose up
```

Then go to <http://localhost>.

## Configuration

TBD.
