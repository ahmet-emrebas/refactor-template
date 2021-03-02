## Refactor-Template CLI

Development tools to generate code from existing templaet or other code files and folders.

### The Goal of Refactor-Template CLI

Improve productivity helping developers to generate code from templates.

### Installing the CLI

To make a local build:

```shell
npm install -g refactor-template
```

### Example

The following example will clone the users folder as products and replace all occurance and all veriations of the text 'users' in folder, file, and file content.

```shell
refactor-template copy users products
```
