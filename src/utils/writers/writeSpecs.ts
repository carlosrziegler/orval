import {camel} from 'case';
import {appendFileSync, existsSync, mkdirSync, writeFileSync} from 'fs';
import {join} from 'path';
import {Options} from '../../types';
import {createSuccessMessage} from '../createSuccessMessage';
import {generateImports} from '../generators/generateImports';
import {resolvePath} from '../resolvers/resolvePath';

const log = console.log; // tslint:disable-line:no-console

export const writeSpecs = (options: Options, backend?: string) => ({
  api,
  models,
  mocks
}: {
  api: {
    output: string;
    imports?: string[] | undefined;
    queryParamDefinitions?: {
      name: string;
      model: string;
      imports?: string[] | undefined;
    }[];
  };
  models: {
    name: string;
    model: string;
    imports?: string[] | undefined;
  }[];
  mocks: {output: string; imports?: string[]};
}) => {
  const {output, types, workDir = ''} = options;

  if (types) {
    const isExist = existsSync(join(process.cwd(), workDir, types));
    if (!isExist) {
      mkdirSync(join(process.cwd(), workDir, types));
    }

    writeFileSync(join(process.cwd(), workDir, `${types}/index.ts`), '');
    models.forEach(({name, model, imports}) => {
      let file = '/* Generated by orval 🍺 */\n';
      file += generateImports(imports);
      file += model;
      writeFileSync(
        join(process.cwd(), workDir, `${types}/${camel(name)}.ts`),
        file
      );
      appendFileSync(
        join(process.cwd(), workDir, `${types}/index.ts`),
        `export * from './${camel(name)}'\n`
      );
    });

    if (api.queryParamDefinitions) {
      api.queryParamDefinitions.forEach(({name, model, imports}) => {
        let file = '/* Generated by orval 🍺 */\n';
        file += generateImports(imports);
        file += model;
        writeFileSync(
          join(process.cwd(), workDir, `${types}/${camel(name)}.ts`),
          file
        );
        appendFileSync(
          join(process.cwd(), workDir, `${types}/index.ts`),
          `export * from './${camel(name)}'\n`
        );
      });
    }
  }

  if (output) {
    let data = `/* Generated by orval 🍺 */

import { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios'
`;
    if (options.mock) {
      data += "import faker from 'faker' \n";
    }

    if (types) {
      data += generateImports(
        options.mock ? [...api.imports, ...mocks.imports] : api.imports,
        resolvePath(
          join(process.cwd(), workDir, output),
          join(process.cwd(), workDir, types)
        ),
        true
      );
    } else {
      data += models.reduce((acc, {model}) => acc + `${model}\n\n`, '');
      if (api.queryParamDefinitions) {
        data += api.queryParamDefinitions.reduce(
          (acc, {model}) => acc + `${model}\n\n`,
          ''
        );
      }
    }
    data += '\n';
    data += api.output;
    writeFileSync(join(process.cwd(), workDir, output), data);
    if (options.mock) {
      appendFileSync(join(process.cwd(), workDir, output), mocks.output);
    }
    log(createSuccessMessage(backend));
  }
};
