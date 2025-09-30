# Monitool

[![Open in Dev Containers](https://img.shields.io/static/v1?label=Dev%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/romain-gilliotte/monitool-public)
[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/12032.svg)](https://uptime.betterstack.com/?utm_source=status_badge)

## About

[www.monitool.org](https://www.monitool.org) is a free platform designed to help humanitarian organizations host, organize, and share logical frameworks for their projects.

Instead of being "Yet Another Form Builder v2.0 ®", Monitool heavily focuses on helping projects get their monitoring and data management planning right by addressing critical questions:

- Which indicators will you use?
- Do you have access to data sources that will enable you to measure them? How often? With which level of detail?
- Once you start measuring them, which figures do you expect to find?
- How much of your operative staff time are you willing to allocate to data collection? Who is responsible for what?
- Will the effects of your project be able to change those indicators in a reasonable timeframe?
- Which corrective actions on your project did you plan in advance for each indicator?

Monitool helps you answer these questions, document them in a tidy manner, and share them with your team and staff.

## Background

Monitool was initially developed as an internal tool at MDM France and has been in production since 2014-2015. This open-source version aims to make the tool available to a broader public in the humanitarian sector.

The project focuses on providing a comprehensive solution for monitoring and evaluation (M&E) activities, helping organizations move beyond simple form building to strategic indicator planning and data management.

## Development Setup

If you have VS Code and Docker installed, click the badge above or [here](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/romain-gilliotte/monitool-public) to get started. This will:

1. Install the Dev Containers extension if needed
2. Clone the source code into a container volume
3. Spin up a complete development environment

**Note**: The first build will take considerable time as it compiles OpenCV4Node.js.

## License

This project is licensed under the GPL-3.0+ License. See the [LICENCE](LICENCE) file for details.

## Related Projects

- [Olap in Memory](https://github.com/romain-gilliotte/olap-in-memory) - The reporting engine powering Monitool's data analysis capabilities
