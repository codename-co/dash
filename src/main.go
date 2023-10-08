package main

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/volume"
	"github.com/docker/docker/client"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func cli() *client.Client {
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		panic(err)
	}
	return cli
}

func Health(c echo.Context) error {
	return c.JSON(http.StatusOK, struct{ Status string }{Status: "OK"})
}

func Config(c echo.Context) error {
	config := make(map[string]string)
	for _, e := range os.Environ() {
		parts := strings.Split(e, "=")
		config[parts[0]] = parts[1]
	}

	return c.JSON(http.StatusOK, config)
}

func DockerIndex(c echo.Context) error {
	cli := cli()

	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{})
	if err != nil {
		panic(err)
	}
	networks, err := cli.NetworkList(context.Background(), types.NetworkListOptions{})
	if err != nil {
		panic(err)
	}
	volumes, err := cli.VolumeList(context.Background(), volume.ListOptions{})
	if err != nil {
		panic(err)
	}
	// swarm
	config, err := cli.ConfigList(context.Background(), types.ConfigListOptions{})
	if err != nil {
		print()
	}
	services, err := cli.ServiceList(context.Background(), types.ServiceListOptions{})
	if err != nil {
		print()
	}
	tasks, err := cli.TaskList(context.Background(), types.TaskListOptions{})
	if err != nil {
		print()
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"config":     config,
		"containers": containers,
		"networks":   networks,
		"services":   services,
		"tasks":      tasks,
		"volumes":    volumes.Volumes,
	})
}

func DockerContainers(c echo.Context) error {
	containers, err := cli().ContainerList(context.Background(), types.ContainerListOptions{
		All: c.QueryParams().Has("all"),
	})
	if err != nil {
		panic(err)
	}

	var filteredContainers []types.Container = containers

	project := os.Getenv("PROJECT")
	if project != "" {
		filteredContainers = nil
		for _, c := range containers {
			var _project = c.Labels["com.docker.compose.project"]
			if len(_project) == 0 {
				_project = "default"
			}
			if _project == project {
				filteredContainers = append(filteredContainers, c)
			}
		}
	}

	return c.JSON(http.StatusOK, filteredContainers)
}

func DockerNetworks(c echo.Context) error {
	networks, err := cli().NetworkList(context.Background(), types.NetworkListOptions{})
	if err != nil {
		panic(err)
	}

	return c.JSON(http.StatusOK, networks)
}

func DockerVolumes(c echo.Context) error {
	volumes, err := cli().VolumeList(context.Background(), volume.ListOptions{})
	if err != nil {
		panic(err)
	}

	return c.JSON(http.StatusOK, volumes)
}

func Index(c echo.Context) error {
	return c.Redirect(http.StatusFound, "/ui/")
}

func main() {
	e := echo.New()

	e.HideBanner = true
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// e.GET("/", Index)

	e.GET("/", Index)
	e.GET("/health", Health)
	e.GET("/api/config", Config)
	e.GET("/api/docker", DockerIndex)
	e.GET("/api/docker/containers", DockerContainers)
	e.GET("/api/docker/networks", DockerNetworks)
	e.GET("/api/docker/volumes", DockerVolumes)
	e.Static("/ui/", "static")

	httpPort := os.Getenv("PORT")
	if httpPort == "" {
		httpPort = "80"
	}

	e.Logger.Fatal(e.Start(":" + httpPort))
}
