const superb = require('superb')
const Generator = require('yeoman-generator')
const _s = require('underscore.string')
const utils = require('./utils')

module.exports = class extends Generator {
  constructor(a, b) {
    super(a, b)

    this.option('org', {
      type: 'string',
      desc: 'Publish to a GitHub organization account',
    })

    this.option('cli', {
      type: 'boolean',
      desc: 'Add a CLI',
    })

    this.option('cov', {
      type: 'boolean',
      desc: 'Add a coverage',
    })
  }
  init() {
    return this.prompt([
      {
        name: 'moduleName',
        message: 'What do you want to name your module?',
        default: _s.slugify(this.appname),
        filter: x => utils.slugifyPackageName(x),
      },
      {
        name: 'moduleDescription',
        message: 'What is your module description?',
        default: `My ${superb()} module`,
      },
      {
        name: 'cli',
        message: 'Do you need a CLI?',
        type: 'confirm',
        default: Boolean(this.options.cli),
        when: () => this.options.cli === undefined,
      },
      {
        name: 'cov',
        message: 'Do you need a covarage?',
        type: 'confirm',
        default: Boolean(this.options.cov),
        when: () => this.options.cov === undefined,
      },
    ]).then(props => {
      const or = (option, prop) =>
        this.options[option] === undefined
          ? props[prop || option]
          : this.options[option]

      const cli = or('cli')
      const cov = or('cov')

      const repoName = utils.repoName(props.moduleName)

      const tpl = {
        moduleName: props.moduleName,
        moduleDescription: props.moduleDescription,
        camelModuleName: _s.camelize(repoName),
        repoName,
        cli,
        cov,
      }

      const mv = (from, to) => {
        this.fs.move(this.destinationPath(from), this.destinationPath(to))
      }

      this.fs.copyTpl(
        [`${this.templatePath()}/**`, '!**/cli.js'],
        this.destinationPath(),
        tpl
      )

      if (cli) {
        this.fs.copyTpl(
          this.templatePath('cli.js'),
          this.destinationPath('cli.js'),
          tpl
        )
      }

      mv('all-contributorsrc', '.all-contributorsrc')
      mv('editorconfig', '.editorconfig')
      mv('eslintrc', '.eslintrc')
      mv('flowconfig', '.flowconfig')
      mv('gitattributes', '.gitattributes')
      mv('gitignore', '.gitignore')
      mv('travis.yml', '.travis.yml')
      mv('prettierrc', '.prettierrc')
      mv('prettierignore', '.prettierignore')
      mv('eslintignore', '.eslintignore')
      mv('_package.json', 'package.json')
      mv('github/ISSUE_TEMPLATE.md', '.github/ISSUE_TEMPLATE.md')
      mv('github/PULL_REQUEST_TEMPLATE.md', '.github/PULL_REQUEST_TEMPLATE.md')
      mv('flow/jest_v23.x.x.js', 'flow-typed/npm/jest_v23.x.x.js')
    })
  }
  git() {
    this.spawnCommandSync('git', ['init'])
  }
  install() {
    // yarn add --dev jest prettier eslint
    const devPkgs = [
      'jest',
      'prettier',
      'eslint',
      'eslint-config-precure',
      'all-contributors-cli',
      'husky',
      'lint-staged',
      'flow-bin',
    ]
    this.yarnInstall(devPkgs, { dev: true })
  }
}
