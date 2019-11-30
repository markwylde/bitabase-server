const righto = require('righto');
const sqlite = require('sqlite-fp');
const writeResponse = require('write-response');

const writeResponseError = require('../../modules/writeResponseError');
const { getConnection } = require('../../modules/cachableSqlite');
const queryStringToSql = require('../../modules/queryStringToSql');
const getCollection = require('../../modules/getCollection');

module.exports = appConfig => function (request, response, params) {
  const collection = righto(getCollection(appConfig), params.databaseName, params.collectionId);

  const dbConnection = righto(getConnection, collection.get('databaseFile'));

  const recordsSql = queryStringToSql.records(`${params.collectionId}_errors`, 'https://localhost' + request.url);
  const records = righto(sqlite.getAll, recordsSql.query, recordsSql.values, dbConnection);

  records(function (error, records) {
    if (error) {
      return writeResponseError(error, response);
    }

    const recordsParsed = records.map(record => ({
      ...record,
      data: JSON.parse(record.data)
    }));
    writeResponse(200, recordsParsed, response);
  });
};
