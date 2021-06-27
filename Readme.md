## Refactor-Template CLI

<code>
    <a href="https://github.com/ahmet-emrebas/refactor-template">     
        <img height="100" title="Code Generator" src="https://raw.githubusercontent.com/ahmet-emrebas/ahmet-emrebas/main/assets/generator-logo.png"/>
    </a>
</code>

<br/>
<br/>
<br/>

CLI Tool to refactor a file tree structure with passed arguments.

### The Goal of Refactor-Template CLI

- boost productivity
- reduce bugs 
- save time

### Installing the CLI

```shell
npm install -g refactor-template
```

### Example

The following example will clone the users folder as products and replace all occurance and all veriations of the text 'users' in folder, file, and file content.

```shell
refactor-template copy <source> <target> <placeholder(optional)> <new-value(optional)>
refactor-template copy src/user  sr/product user product
```


#### Commands 

<p> To see available commands , run the help command 

```shell
refactor-template --help
```
