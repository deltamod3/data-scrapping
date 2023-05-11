const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const axios = require("axios");
const cheerio = require("cheerio");

const client = new DynamoDBClient();
const dynamodbClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
const BASE_URL = "https://www.amazon.com";

const getApiGatewayResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body,
  };
};

exports.handler = async (event) => {
  try {
    const { sessionId, searchKey } = event.queryStringParameters;

    // Check SessionId, searchKey
    if (!sessionId || !searchKey) {
      return getApiGatewayResponse(200, JSON.stringify([]));
    }

    // Check history
    const queryParams = {
      TableName: process.env.HISTORY_TABLE_NAME,
      IndexName: "sessionId-searchKey-index",
      Select: "ALL_ATTRIBUTES",
      KeyConditionExpression:
        "#sessionId = :sessionId AND #searchKey = :searchKey",
      ExpressionAttributeValues: {
        ":sessionId": sessionId,
        ":searchKey": searchKey,
      },
      ExpressionAttributeNames: {
        "#sessionId": "sessionId",
        "#searchKey": "searchKey",
      },
      ScanIndexForward: false,
      Limit: 1,
    };
    const historyData = await dynamodbClient.send(
      new QueryCommand(queryParams)
    );
    if (historyData.Items.length > 0) {
      return getApiGatewayResponse(
        200,
        JSON.stringify(historyData.Items[0].results || [])
      );
    }

    // Search data from Amazon
    const searchUrl = `${BASE_URL}/s?k=${searchKey}&ref=nb_sb_noss`;
    console.log(searchUrl);

    const response = await axios.get(searchUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36",
      },
    });

    const html = response.data;

    const $ = cheerio.load(html);
    const results = [];
    $(".s-result-item.s-asin").each((_idx, el) => {
      if (results.length >= 9) {
        return false;
      }

      const shelf = $(el);
      const title = shelf
        .find("span.a-color-base.a-text-normal")
        .text();
      const image = shelf.find("img.s-image").attr("src");
      const link = shelf.find("a.a-link-normal.s-no-outline").attr("href");
      results.push({
        title,
        image,
        link: `${BASE_URL}${link}`,
      });
    });
    console.log(JSON.stringify(results));

    // Save search results
    const putParams = {
      TableName: process.env.HISTORY_TABLE_NAME,
      Item: {
        sessionId,
        createdAt: new Date().toISOString(),
        searchKey,
        results,
      },
    };

    await dynamodbClient.send(new PutCommand(putParams));

    return getApiGatewayResponse(200, JSON.stringify(results));
  } catch (error) {
    console.error("Error:", error);

    return getApiGatewayResponse(400, JSON.stringify(error));
  }
};
