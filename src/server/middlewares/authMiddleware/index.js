import assert from 'assert';
import log from '../../logger';
import config from '../../config';

const authMWResolver = async (resolve, root, args, context, info) => {
  assert(config.tierAccessLevel === 'private', 'Auth middleware layer only for "private" tier access level');
  const { authHelper } = context;

  // if mock arborist endpoint, just skip auth middleware
  if (!config.internalLocalTest) {
    if (config.arboristEndpoint === 'mock') {
      log.debug('[authMiddleware] using mock arborist endpoint, skip auth middleware');
      return resolve(root, args, context, info);
    }
  }

  // asking arborist for auth resource list, and add to filter args
  const parsedFilter = args.filter;
  const appliedFilter = await authHelper.applyAccessibleFilter(parsedFilter);
  const newArgs = {
    ...args,
    filter: appliedFilter,
  };
  if (typeof newArgs.filter === 'undefined') {
    delete newArgs.filter;
  }
  return resolve(root, newArgs, context, info);
};

// apply this middleware to all es types' data/aggregation resolvers
const typeMapping = config.esConfig.indices.reduce((acc, item) => {
  acc[item.type] = authMWResolver;
  return acc;
}, {});
const authMiddleware = {
  Query: {
    ...typeMapping,
  },
  Aggregation: {
    ...typeMapping,
  },
};

export default authMiddleware;
