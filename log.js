module.exports = (...args) => console.log.apply(new Date().toLocaleString('lt'), args)