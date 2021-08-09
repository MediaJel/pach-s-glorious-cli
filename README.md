# Pach's glorious CLI v2

An evolution of the original Pach's handy dandy cli but better.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

<!-- toc -->

- [Pach's glorious CLI v2](#pachs-glorious-cli-v2)
- [Installation](#installation)
- [Commands](#commands)
<!-- tocstop -->

# Installation

You may install this CLI via npm. You will need to run `pach configure` so
as to generate your configuration file. Please follow the instructions.

Run these commands to install:

```bash

npm install -g pach-cli ##Sudo if you have to

pach configure

```

# Commands

<!-- commands -->

- [`pach configure`](#pach-configure)
- [`pach help [COMMAND]`](#pach-help-command)
- [`pach query TYPE`](#pach-query-type)
- [`pach reports TYPE`](#pach-reports-type)
- [`pach update [CHANNEL]`](#pach-update-channel)

## `pach configure`

Initial configuration for CLI usage

```
USAGE
  $ pach configure
```

_See code: [src/commands/configure.ts](https://github.com/pacholoamit/pach-cli-v2/blob/v1.2.0/src/commands/configure.ts)_

## `pach help [COMMAND]`

display help for pach

```
USAGE
  $ pach help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `pach query TYPE`

Query specific app ids from Snowflake database

```
USAGE
  $ pach query TYPE

OPTIONS
  -a, --appId=appId  (required) flag to declare the app id to query
  -h, --help         Help documentation
  -l, --limit=limit  [default: NULL] flag to declare the limit of entries to be returned (note: NULL === no limits)
```

_See code: [src/commands/query.ts](https://github.com/pacholoamit/pach-cli-v2/blob/v1.2.0/src/commands/query.ts)_

## `pach reports TYPE`

Generate automated reports via the Google Sheets API.

```
USAGE
  $ pach reports TYPE

OPTIONS
  -h, --help                 Help documentation
  -q, --quiet                Specified sheet name to process reports on
  -s, --sheetName=sheetName  (required) Specified sheet name to process reports on
```

_See code: [src/commands/reports.ts](https://github.com/pacholoamit/pach-cli-v2/blob/v1.2.0/src/commands/reports.ts)_

## `pach update [CHANNEL]`

update the pach CLI

```
USAGE
  $ pach update [CHANNEL]
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v1.3.10/src/commands/update.ts)_

<!-- commandsstop -->
