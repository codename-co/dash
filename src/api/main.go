package main

import (
	"context"
	"encoding/json"
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

func Containers(all bool) []types.Container {
	containers, err := cli().ContainerList(context.Background(), types.ContainerListOptions{
		All: all,
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

	return filteredContainers
}

func Images() []types.ImageSummary {
	images, err := cli().ImageList(context.Background(), types.ImageListOptions{})
	if err != nil {
		panic(err)
	}

	return images
}

func Networks() []types.NetworkResource {
	networks, err := cli().NetworkList(context.Background(), types.NetworkListOptions{})
	if err != nil {
		panic(err)
	}

	return networks
}

func Volumes() volume.ListResponse {
	volumes, err := cli().VolumeList(context.Background(), volume.ListOptions{})
	if err != nil {
		panic(err)
	}

	return volumes
}

type response struct {
	Command string `json:"type"`
	Data    any    `json:"data"`
}

func SendJSON(c echo.Context, command string, data interface{}) error {
	out, err := json.Marshal(&response{
		Command: command,
		Data:    data,
	})
	if err != nil {
		return err
	}

	return c.JSONBlob(http.StatusOK, out)
}

func DockerHandler(c echo.Context) error {
	switch command := c.QueryParam("type"); command {

	case "containers":
		SendJSON(c, command, Containers(false))

	case "containers-all":
		SendJSON(c, command, Containers(true))

	case "images":
		SendJSON(c, command, Images())

	case "networks":
		SendJSON(c, command, Networks())

	case "volumes":
		SendJSON(c, command, Volumes())

	default:
		SendJSON(c, "error", "{\"status\":\"error\"}")
	}

	return nil
}

func main() {
	e := echo.New()

	e.HideBanner = true
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Skipper: func(c echo.Context) bool {
			// TODO: filtered access logs
			return c.Path() == "/" || strings.HasPrefix(c.Path(), "/api") || strings.HasPrefix(c.Path(), "/ws")
		},
	}))
	e.Use(middleware.Recover())

	e.Static("/", "static")
	e.GET("/api/config", Config)
	e.GET("/api/docker", DockerHandler)
	e.GET("/health", Health)

	httpPort := os.Getenv("PORT")
	if httpPort == "" {
		httpPort = "80"
	}

	e.Logger.Fatal(e.Start(":" + httpPort))
}
