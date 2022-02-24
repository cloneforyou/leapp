leapp
=================

Leapp's Command Line Interface.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@noovolari/leapp-core.svg)](https://npmjs.org/package/@noovolari/leapp-cli)
[![Downloads/week](https://img.shields.io/npm/dw/@noovolari/leapp-core.svg)](https://npmjs.org/package/@noovolari/leapp-cli)
[![License](https://img.shields.io/npm/l/@noovolari/leapp-core.svg)](https://github.com/Noovolari/leapp/package.json)
<!--[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)-->

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g leapp
$ leapp COMMAND
running command...
$ leapp (--version)
leapp/0.1.0 darwin-x64 node-v16.13.2
$ leapp --help [COMMAND]
USAGE
  $ leapp COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`leapp help [COMMAND]`](#leapp-help-command)
* [`leapp idp-url create`](#leapp-idp-url-create)
* [`leapp idp-url delete`](#leapp-idp-url-delete)
* [`leapp idp-url edit`](#leapp-idp-url-edit)
* [`leapp integration list`](#leapp-integration-list)
* [`leapp profile create`](#leapp-profile-create)
* [`leapp profile delete`](#leapp-profile-delete)
* [`leapp profile edit`](#leapp-profile-edit)
* [`leapp region get-default`](#leapp-region-get-default)
* [`leapp region set-default`](#leapp-region-set-default)
* [`leapp session add`](#leapp-session-add)
* [`leapp session change-region`](#leapp-session-change-region)
* [`leapp session delete`](#leapp-session-delete)
* [`leapp session list`](#leapp-session-list)
* [`leapp session start`](#leapp-session-start)
* [`leapp session stop`](#leapp-session-stop)

## `leapp help [COMMAND]`

Display help for leapp.

```
USAGE
  $ leapp help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for leapp.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `leapp idp-url create`

Create a new identity provider URL

```
USAGE
  $ leapp idp-url create

DESCRIPTION
  Create a new identity provider URL

EXAMPLES
  $leapp idp-url create
```

## `leapp idp-url delete`

Delete an identity provider URL

```
USAGE
  $ leapp idp-url delete

DESCRIPTION
  Delete an identity provider URL

EXAMPLES
  $leapp idp-url delete
```

## `leapp idp-url edit`

Edit an identity provider URL

```
USAGE
  $ leapp idp-url edit

DESCRIPTION
  Edit an identity provider URL

EXAMPLES
  $leapp idp-url edit
```

## `leapp integration list`

Show integrations list

```
USAGE
  $ leapp integration list [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output csv|json|yaml |  |
    [--csv | --no-truncate]] [--no-header | ]

FLAGS
  -x, --extended     show extra columns
  --columns=<value>  only show provided columns (comma-separated)
  --csv              output is csv format [alias: --output=csv]
  --filter=<value>   filter property by partial string matching, ex: name=foo
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>
  --sort=<value>     property to sort by (prepend '-' for descending)

DESCRIPTION
  Show integrations list

EXAMPLES
  $leapp integration list
```

## `leapp profile create`

Create a new AWS named profile

```
USAGE
  $ leapp profile create

DESCRIPTION
  Create a new AWS named profile

EXAMPLES
  $leapp profile create
```

## `leapp profile delete`

Delete an AWS named profile

```
USAGE
  $ leapp profile delete

DESCRIPTION
  Delete an AWS named profile

EXAMPLES
  $leapp profile delete
```

## `leapp profile edit`

Rename an AWS named profile

```
USAGE
  $ leapp profile edit

DESCRIPTION
  Rename an AWS named profile

EXAMPLES
  $leapp profile edit
```

## `leapp region get-default`

Displays the default region

```
USAGE
  $ leapp region get-default

DESCRIPTION
  Displays the default region

EXAMPLES
  $leapp region get-default
```

## `leapp region set-default`

Change the default region

```
USAGE
  $ leapp region set-default

DESCRIPTION
  Change the default region

EXAMPLES
  $leapp region set-default
```

## `leapp session add`

Add a new session

```
USAGE
  $ leapp session add

DESCRIPTION
  Add a new session

EXAMPLES
  $leapp session add
```

## `leapp session change-region`

Change a session region

```
USAGE
  $ leapp session change-region

DESCRIPTION
  Change a session region

EXAMPLES
  $leapp session change-region
```

## `leapp session delete`

Delete a session

```
USAGE
  $ leapp session delete

DESCRIPTION
  Delete a session

EXAMPLES
  $leapp session delete
```

## `leapp session list`

Show sessions list

```
USAGE
  $ leapp session list [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output csv|json|yaml |  |
    [--csv | --no-truncate]] [--no-header | ]

FLAGS
  -x, --extended     show extra columns
  --columns=<value>  only show provided columns (comma-separated)
  --csv              output is csv format [alias: --output=csv]
  --filter=<value>   filter property by partial string matching, ex: name=foo
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>
  --sort=<value>     property to sort by (prepend '-' for descending)

DESCRIPTION
  Show sessions list

EXAMPLES
  $leapp session list
```

## `leapp session start`

Start a session

```
USAGE
  $ leapp session start

DESCRIPTION
  Start a session

EXAMPLES
  $leapp session start
```

## `leapp session stop`

Stop a session

```
USAGE
  $ leapp session stop

DESCRIPTION
  Stop a session

EXAMPLES
  $leapp session stop
```
<!-- commandsstop -->
