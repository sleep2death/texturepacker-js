'use strict'
const fs = require('fs')
const mkdirp = require('mkdirp')

const async = require('async')
const ProgressBar = require('progress')

const pack = require('../tp/packer')

var hasAlpha = false // same pet has alpha channel

const ACTION = ['idle', 'run', 'attack', 'damage', 'death', 'defence', 'skill_magic']
const ACTION_A = ['idle_a', 'run_a', 'attack_a', 'damage_a', 'death_a', 'defence_a', 'skill_magic_a']

module.exports = (input, output, option, callback) => {
  readDir(input, output, `${option.pet}/${option.action}`, callback)
}

function readDir(root, output, path, callback) {
  fs.readdir(`${root}/${path}`, (err, files) => {
    if(err) throw err

    const bar = new ProgressBar('Packing sprites: [:bar] :current/:total :input -> :output', {
      total: files.length
    }) 
    
    if(files.length > 7){
    	hasAlpha = true;
    }else{
        hasAlpha = false;
    }

    /*
	if(hasAlpha){
		//包含Alpha通道的怪物
		async.eachSeries(files, (file, next) => {
		const p = /([pet])\/(.+)/.exec(path)[2]
	    if(ACTION.indexOf(file) >= 0) {
            createSprite(root, output, {path: `${path}/${file}`, name: file, hasAlpha: true, isAlpha: false}, next)	
	        bar.tick({input: `${root}/${path}`, output: `${output}/${p}/${file}`})
	    }else{
	        next()
	    }
	    }, callback)
	}else{
		//不包含Alpha通道的怪物
		async.eachSeries(files, (file, next) => {
	    if(ACTION.indexOf(file) >= 0) {
            createSprite(root, output, {path: `${path}/${file}`, name: file, hasAlpha: false, isAlpha: false}, next)	     
            const p = /([pet])\/(.+)/.exec(path)[2]
            bar.tick({input: `${root}/${path}`, output: `${output}/${p}/${file}`})
	    }else{
	        next()
	    }
	    }, callback)
    }
    */
        async.eachSeries(files, (file, next) => {
		const p = /([pet])\/(.+)/.exec(path)[2]
	    if(ACTION.indexOf(file) >= 0) {
            createSprite(root, output, {path: `${path}/${file}`, name: file, hasAlpha: hasAlpha}, next)	
	        bar.tick({input: `${root}/${path}`, output: `${output}/${p}/${file}`})
	    }else{
	        next()
	    }
	    }, callback)

  })
}

function createSprite(root, output, options, next) {
    const p = /([pet])\/(.+)/.exec(options.path)[2]
    mkdirp(`${output}/${p}`, err => {
    if(err) throw err
        mkdirp(`${output}/${p}/a`, error => {
        if(error) throw error
        pack(`${root}/${options.path}`, {output: `${output}/${p}`, name: options.name, hasAlpha: options.hasAlpha}, next)
    })
  })
}
