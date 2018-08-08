export function TMap() {
  return new Promise(function(resolve, reject) {
    window.init = function() {
      resolve(qq)
    }
    const key = process.env.QQ_MAP_KEY
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `http://map.qq.com/api/js?v=2.exp&callback=init&key=${key}&libraries=drawing,geometry,autocomplete,convertor`
    script.onerror = reject
    document.head.appendChild(script)
  })
}
