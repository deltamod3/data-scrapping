const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const dynamodbClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

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
    const { sessionId } = event.queryStringParameters;

    // Check SessionId, searchKey
    if (!sessionId) {
      return getApiGatewayResponse(200, JSON.stringify([]));
    }

    // Check history
    const queryParams = {
      TableName: process.env.HISTORY_TABLE_NAME,
      Select: "ALL_ATTRIBUTES",
      KeyConditionExpression: "#sessionId = :sessionId",
      ExpressionAttributeValues: {
        ":sessionId": sessionId,
      },
      ExpressionAttributeNames: {
        "#sessionId": "sessionId",
      },
      ScanIndexForward: false,
      Limit: 10,
    };
    const historyData = await dynamodbClient.send(
      new QueryCommand(queryParams)
    );

    return getApiGatewayResponse(200, JSON.stringify(historyData.Items));
  } catch (error) {
    console.error("Error:", error);

    return getApiGatewayResponse(400, JSON.stringify(error));
  }
};
