<!--
title: 'AWS NodeJS Example'
description: 'This template demonstrates how to deploy a NodeJS function running on AWS Lambda using the traditional Serverless Framework.'
layout: Doc
framework: v3
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->


# Data Scrapping Backend Project with Serverless framework

This backend project has been written with Node.js and Serverless framework.

## Usage

### Deployment

In order to deploy the project, you need to run the following command:

```
$ serverless deploy [--stage=dev]
```

After running deploy, you should see output similar to:

```bash
Deploying data-scrapping-service to stage dev (eu-north-1)

✔ Service deployed to stack data-scrapping-service-dev (95s)

endpoints:
  GET - https://bdo96xvqd5.execute-api.eu-north-1.amazonaws.com/dev/search
  GET - https://bdo96xvqd5.execute-api.eu-north-1.amazonaws.com/dev/history
functions:
  SearchFunction: data-scrapping-service-dev-SearchFunction (2.3 kB)
  GetResultsFunction: data-scrapping-service-dev-GetResultsFunction (2.3 kB)
layers:
  ExternalDepsModule: arn:aws:lambda:eu-north-1:738184990914:layer:ExternalDepsModule:6
```

### Invocation

After successful deployment, you can invoke the deployed function by calling API endpoints.

```bash
[GET] https://6c7kwym2u9.execute-api.eu-north-1.amazonaws.com/dev/search?searchKey=computer
```

Which should result in response similar to the following:

```json
[
    {
        "title": "HP Elite Desktop PC Computer Intel Core i5 3.1-GHz, 8 gb Ram, 1 TB Hard Drive, DVDRW, 19 Inch LCD Monitor, Keyboard, Mouse, Wireless WiFi, Windows 10 (Renewed)",
        "image": "https://m.media-amazon.com/images/I/718sn7oOcfL._AC_UY218_.jpg",
        "link": "https://www.amazon.com/HP-Desktop-Computer-Package-Keyboard/dp/B07SBK9LRY/ref=sr_1_1?keywords=computer&qid=1683823956&sr=8-1"
    }
]
```

### Local development

You can use Serverless offline for local development:

```bash
serverless offline
```
Then it will run the serverless project on local port 3000.
