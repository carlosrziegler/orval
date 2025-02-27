import { faker } from '@faker-js/faker';
import { defineConfig } from 'orval';

export default defineConfig({
  petstore: {
    output: {
      mode: 'split',
      target: 'src/api/endpoints/petstoreFromFileSpecWithTransformer.ts',
      schemas: 'src/api/model',
      client: 'react-query',
      mock: true,
      override: {
        mutator: {
          path: './src/api/mutator/custom-client.ts',
          name: 'customClient',
        },
        operations: {
          listPets: {
            mock: {
              properties: () => ({
                '[].id': () => faker.datatype.number({ min: 1, max: 99999 }),
              }),
            },
          },
          showPetById: {
            mock: {
              data: () => ({
                id: faker.datatype.number({ min: 1, max: 99 }),
                name: faker.name.firstName(),
                tag: faker.helpers.arrayElement([
                  faker.random.word(),
                  undefined,
                ]),
              }),
            },
          },
        },
        mock: {
          properties: {
            '/tag|name/': () => faker.name.lastName(),
          },
        },
        query: {
          useQuery: true,
          useInfinite: true,
          useInfiniteQueryParam: 'limit',
        },
      },
    },
    input: {
      target: './petstore.yaml',
      override: {
        transformer: './src/api/transformer/add-version.js',
      },
    },
  },
});
