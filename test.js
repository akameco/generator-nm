import path from 'path'
import test from 'ava'
import helpers from 'yeoman-test'
import assert from 'yeoman-assert'
import pify from 'pify'
import utils from './app/utils'

let generator

test.beforeEach(async () => {
  await pify(helpers.testDirectory)(path.join(__dirname, 'temp'))
  generator = helpers.createGenerator('nm:app', ['../app'], null, {
    skipInstall: true,
  })
})

test.serial('generates expected files', async () => {
  helpers.mockPrompt(generator, {
    moduleName: 'test',
    cli: false,
    cov: false,
  })

  await pify(generator.run.bind(generator))()

  assert.file([
    '.editorconfig',
    '.git',
    '.eslintrc',
    '.gitattributes',
    '.all-contributorsrc',
    '.gitignore',
    '.travis.yml',
    '.flowconfig',
    'index.js',
    'license',
    'package.json',
    'readme.md',
    'test.js',
    '.github/ISSUE_TEMPLATE.md',
    '.github/PULL_REQUEST_TEMPLATE.md',
    'flow-typed/npm/jest_v23.x.x.js',
  ])

  assert.noFile('cli.js')
})

test.serial('CLI option', async () => {
  helpers.mockPrompt(generator, {
    moduleName: 'test',
    cli: true,
    cov: true,
  })

  await pify(generator.run.bind(generator))()

  assert.file('cli.js')
  assert.fileContent('package.json', /"bin":/)
  assert.fileContent('package.json', /"bin": "cli.js"/)
  assert.fileContent('package.json', /"meow"/)
})

test('parse scoped package names', t => {
  t.is(
    utils.slugifyPackageName('author/thing'),
    'author-thing',
    'slugify non-scoped packages'
  )
  t.is(
    utils.slugifyPackageName('@author/thing'),
    '@author/thing',
    'accept scoped packages'
  )
  t.is(
    utils.slugifyPackageName('@author/hi/there'),
    'author-hi-there',
    'fall back to regular slugify if invalid scoped name'
  )
})

test.serial('prompts for description', async () => {
  helpers.mockPrompt(generator, {
    moduleName: 'test',
    moduleDescription: 'foo',
    cli: false,
    cov: false,
  })

  await pify(generator.run.bind(generator))()

  assert.fileContent('package.json', /"description": "foo",/)
  assert.fileContent('readme.md', /> foo/)
})

test.serial('defaults to superb description', async () => {
  helpers.mockPrompt(generator, {
    moduleName: 'test',
    cli: false,
    cov: false,
  })

  await pify(generator.run.bind(generator))()

  assert.fileContent('package.json', /"description": "My .+ module",/)
  assert.fileContent('readme.md', /> My .+ module/)
})
