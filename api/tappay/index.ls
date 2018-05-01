require! <[./base]>

if require.main == module => # from command line
else # as a module from require

module.exports = base <<< {}
