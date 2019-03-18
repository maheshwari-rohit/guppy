import elasticsearch from 'elasticsearch';
import config from '../config';
import { query, getESFieldsTypes } from './connector';
import * as esFilter from './filter';
import * as esAggregator from './aggs';

class ES {
  constructor(esConfig = config.esConfig) {
    this.config = esConfig;
    console.log(`connecting elasticsearch cluster at ${this.config.host}.`);
    this.client = new elasticsearch.Client({
      host: this.config.host,
      // log: 'trace'
    });
    // this.client.ping({
    //   requestTimeout: 30000,
    // }, (error) => {
    //   if (error) {
    //     console.error(`elasticsearch cluster at ${this.config.host} is down!`);
    //   } else {
    //     console.log(`connected to elasticsearch at ${esConfig.host}.`);
    //     this.connected = true;
    //   }
    // });
    this._query = query(this.client, esConfig);
  }

  async initialize() {
    // get fields type from elasticsearch
    this.fieldTypes = await getESFieldsTypes(this.client, this.config);
    return this.fieldTypes;
  }

  _getESContext() {
    return {
      queryHandler: this._query,
      fieldTypes: this.fieldTypes,
    };
  }

  getESFieldTypeMapping() {
    return this.fieldTypes;
  }

  getESFields() {
    return Object.keys(this.fieldTypes);
  }

  async getCount(filter) {
    return esFilter.getCount(this._getESContext(), filter);
  }

  async getData(fields, filter, sort, offset = 0, size) {
    return esFilter.getData(this._getESContext(), fields, filter, sort, offset, size);
  }

  async numericAggregation({
    filter,
    field,
    rangeStart,
    rangeEnd,
    rangeStep,
    binCount,
    filterSelf,
  }) {
    return esAggregator.numericAggregation(this._getESContext(), {
      filter,
      field,
      rangeStart,
      rangeEnd,
      rangeStep,
      binCount,
      filterSelf,
    });
  }

  async textAggregation({
    filter,
    field,
    filterSelf,
  }) {
    return esAggregator.textAggregation(this._getESContext(), {
      filter,
      field,
      filterSelf,
    });
  }
}

const es = new ES();

export default es;
