# Monitool

[![Open in Dev Containers](https://img.shields.io/static/v1?label=Dev%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/romain-gilliotte/monitool-public)
[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/12032.svg)](https://uptime.betterstack.com/?utm_source=status_badge)

## About

[www.monitool.org](www.monitool.org) is a free platform to host, organize, and share logical frameworks for humanitarian organizations.

Instead of being "Yet Another Form Builder v2.0 ®", it heavily focuses on helping projects get their monitoring and data management planning right.

- Which indicators will you use?
- Do you have access to data-sources that will enable you to measure them? How often? With which level of detail?
- Once you start measuring them, which figures do you expect to find?
- How much of your operative staff time are you willing to allocate to data collection? Who is reponsible for what?
- Will the effects of your project be able to change those indicators in a reasonable timeframe?
- Which correctives actions on your project did you plan in advance for each indicator?

Those are the questions that we hope that using Monitool will help you to answer, write down in a tidy manner and share with your team and staff.

## Why

Monitool was initially developped as an internal tool at MDM France, which has been in production since 2014-2015.

This version is a work in progress, which aims to have a version of the tool which can be usable by a broader public.
It is close to completion (check remaining issues).

## Development

If you already have VS Code and Docker installed, you can click the badge above or [here](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/romain-gilliotte/monitool-public) to get started. Clicking these links will cause VS Code to automatically install the Dev Containers extension if needed, clone the source code into a container volume, and spin up a dev container for use.

Spining the dev container may be a bit slow the first time, as it will download the necessary images and build opencv4nodejs.

- Monitool should be reachable at http://localhost:8080
- Mongo Express at http://localhost:8081/
- RedisCommander at http://localhost:8082/

### Tests

Monitool itself does not come yet with unit / integration tests.

However, most code dealing with the reporting is in the [Olap in memory](https://github.com/romain-gilliotte/olap-in-memory) companion package, which is properly unit tested.

This repository is mainly for the GUI and the CRUD API.
