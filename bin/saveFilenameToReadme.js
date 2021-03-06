#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const githubUrl = 'https://github.com/2json/articles/blob/master/'
const postPath = path.resolve(__dirname, '../')
const dirs = readdir(postPath)
const excludes = ['bin']
let mdTemplate = '## :book: My Article \n\n ![作者](https://img.shields.io/badge/author-saisai-brightgreen.svg) ![微信](https://img.shields.io/badge/wechat-saisai1457358080-orange.svg) ![QQ](https://img.shields.io/badge/QQ-1457358080-yellowgreen.svg) ![警告](https://img.shields.io/badge/%E8%AD%A6%E5%91%8A-%E4%BF%BA%E7%9A%84%E6%96%87%E7%AB%A0%E5%86%99%E7%9A%84%E4%B8%8D%E5%A5%BD%EF%BC%8C%E4%BD%86%E6%98%AF%E6%88%91%E4%B9%9F%E5%B8%8C%E6%9C%9B%E4%BD%A0%E6%8B%BF%E8%B5%B0%E7%9A%84%E6%97%B6%E5%80%99%E5%A4%87%E6%B3%A8%E4%B8%80%E4%B8%8B%E5%8E%9F%E6%96%87%E5%9C%B0%E5%9D%80%F0%9F%98%A2-red.svg) \n\n> 这些文章都是我自己写的，一些个人的观点。如果你能看到，欢迎交流哈！！!\n\n'
pushToReadme()

function pushToReadme() {
    const template = makeMdTemplate(dirs)
    return fs.writeFileSync(`${postPath}/README.md`, template, 'utf8')
}

function makeMdTemplate(dirs = []) {
    const files = readFileName(dirs)
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