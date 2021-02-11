# Monitool

## About

[www.monitool.org](www.monitool.org) is a free platform to host, organize, and share logical frameworks for humanitarian organizations.

Instead of being "Yet Another Form Builder v2.0 ®", it heavily focuses on helping projects get their monitoring and data management planning right.

-   Which indicators will you use?
-   Do you have access to data-sources that will enable you to measure them? How often? With which level of detail?
-   Once you start measuring them, which figures do you expect to find?
-   How much of your operative staff time are you willing to allocate to data collection? Who is reponsible for what?
-   Will the effects of your project be able to change those indicators in a reasonable timeframe?
-   Which correctives actions on your project did you plan in advance for each indicator?

Those are the questions that we hope that using Monitool will help you to answer, write down in a tidy manner and share with your team and staff.

## Why

Monitool was initially developped as an internal tool at MDM France, which has been in production since 2014-2015.

This version is a work in progress, which aims to have a version of the tool which can be usable by a broader public.
It is close to completion (check remaining issues).

## Development

### System dependencies

The worker depends on `gm` and `libreoffice`.

Install binary dependency on your machine with `sudo apt install graphicsmagick` or `brew install graphicsmagick`

### External dependencies

The application depends on external processes which can be started from the docker-compose file at the root of the project.

-   MongoDB for storage (needs to be started in replica set mode)
-   Redis for cache and work queues
-   UnoConv for thumbnailing

Start them with `docker-compose up`.

On first start, you'll need to initiate a single node replica set.

```
docker exec monitool_mongo_1 sh -c "mongo -u admin -p admin --eval 'rs.initiate({_id: 'rs0', members: [{_id:1, host:'localhost:27017'}]})'"
```

### Authentication

A valid account at Auth0 is required for authentication.

### Running the app

Start by creating `.env` files in `api/` and `workers/` folders. A template is available on the same folder.

Then run on the three root folders: `npm install && npm start`

-   Monitool should be reachable at http://localhost:8080/app.html
-   Mongo Express at http://localhost:8081/
-   RedisCommander at http://localhost:8082/

### Tests

Monitool itself does not come yet with unit / integration tests.

However, most code dealing with the reporting is in the [Olap in memory](https://github.com/romain-gilliotte/olap-in-memory) companion package, which is properly unit tested.

This repository is mainly for the GUI and the CRUD API.
