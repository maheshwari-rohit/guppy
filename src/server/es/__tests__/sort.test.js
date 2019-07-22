// eslint-disable-next-line
import nock from 'nock'; // must import this to enable mock data by nock
import { UserInputError } from 'apollo-server';
import getESSortBody from '../sort';
import esInstance from '../index';
import setupMockDataEndpoint from '../../__mocks__/mockDataFromES';

jest.mock('../../config');
jest.mock('../../logger');

setupMockDataEndpoint();
const esIndex = 'gen3-dev-subject';

describe('Transfer GraphQL sort argument to ES sort argument', () => {
  test('object format sort arg', async () => {
    await esInstance.initialize();
    const graphQLSort1 = { gender: 'asc' };
    const expectedESSort1 = [{ gender: 'asc' }];
    const resultESSort1 = getESSortBody(graphQLSort1, esInstance, esIndex);
    expect(resultESSort1).toEqual(expectedESSort1);

    const graphQLSort2 = { gender: 'asc', file_count: 'desc' };
    const expectedESSort2 = [{ gender: 'asc' }, { file_count: 'desc' }];
    const resultESSort2 = getESSortBody(graphQLSort2, esInstance, esIndex);
    expect(resultESSort2).toEqual(expectedESSort2);
  });

  test('array format sort arg', async () => {
    await esInstance.initialize();
    const graphQLSort1 = [{ gender: 'asc' }];
    const expectedESSort1 = [{ gender: 'asc' }];
    const resultESSort1 = getESSortBody(graphQLSort1, esInstance, esIndex);
    expect(resultESSort1).toEqual(expectedESSort1);

    const graphQLSort2 = [{ gender: 'asc' }, { file_count: 'desc' }];
    const expectedESSort2 = [{ gender: 'asc' }, { file_count: 'desc' }];
    const resultESSort2 = getESSortBody(graphQLSort2, esInstance, esIndex);
    expect(resultESSort2).toEqual(expectedESSort2);
  });

  test('array format sort arg with nonexisting field', async () => {
    await esInstance.initialize();
    expect(() => {
      const graphQLSort = { invalid_field: 'asc' };
      getESSortBody(graphQLSort, esInstance, esIndex);
    }).toThrow(UserInputError);

    expect(() => {
      const graphQLSort = [{ invalid_field: 'asc' }];
      getESSortBody(graphQLSort, esInstance, esIndex);
    }).toThrow(UserInputError);

    expect(() => {
      const graphQLSort = { gender: 'female', invalid_field: 'asc' };
      getESSortBody(graphQLSort, esInstance, esIndex);
    }).toThrow(UserInputError);
  });

  test('array format sort arg with invalid method', async () => {
    await esInstance.initialize();
    expect(() => {
      const graphQLSort = { gender: 'invalid_method' };
      getESSortBody(graphQLSort, esInstance, esIndex);
    }).toThrow(UserInputError);

    expect(() => {
      const graphQLSort = [{ gender: 'invalid_method' }];
      getESSortBody(graphQLSort, esInstance, esIndex);
    }).toThrow(UserInputError);

    expect(() => {
      const graphQLSort = { gender: 'asc', file_count: 'invalid_method' };
      getESSortBody(graphQLSort, esInstance, esIndex);
    }).toThrow(UserInputError);
  });
});