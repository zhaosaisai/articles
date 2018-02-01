#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const githubUrl = 'https://github.com/2json/articles/blob/master/'
const postPath = path.resolve(__dirname, '../')
const dirs = readdir(postPath)
const excludes = ['bin']

pushToReadme()

function pushToReadme() {
    const template = makeMdTemplate(dirs)
    return fs.writeFileSync(`${postPath}/README.md`, template, 'utf8')
}

function makeMdTemplate(dirs = []) {
    const files = readFileName(dirs)
    let mdTemplate = '## :book: My Article \n\n> 这些文章都是我自己写的，一些个人的观点。如果你能看到，欢迎交流哈！！!\n\n'
    Object.keys(files).sort(() => 1).forEach(file => {
        mdTemplate += `### ${file}\n`
        for(let name of files[file]) {
            mdTemplate += `* [${trimRight(name, '.md')}](${githubUrl}${file}/${encodeURIComponent(name)})\n`
        }    
    })
    return mdTemplate
}

function readFileName(dirs = []) {
    const files = {}
    for(let dir of dirs) {
        if(dir.startsWith('.') || excludes.includes(dir)) {
            continue
        }else {
            const dirPath = `${postPath}/${dir}`
            const stat = fs.statSync(dirPath)
            if(stat.isDirectory()) {
                files[dir] = readdir(dirPath)
            }
        }
    }
    return files
}

function readdir(path) {
    let dirs = []
    try {
        dirs = fs.readdirSync(path)
    }catch(e) {
        console.error(`读取${path}下的文件夹出错`)
    }
    return dirs
}

function trimRight(str = "", spe = "") {
    if(str.endsWith(spe)) {
        return str.slice(0, str.length - spe.length)
    }
    return str
}