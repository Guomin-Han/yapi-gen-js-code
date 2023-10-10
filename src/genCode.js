const config = require('./config')

module.exports = function genCode(interfaceList) {
  let code = config.globalCode || '';

  function getParamComment(info) {
    const note = `${info.required == 1 ? '* ' : ''}${!info.desc || info.desc === info.name ? '' : `${info.desc.replace(/\r+|\n+/g, '; ')}`}`
    return `    ${info.name}: ${info.type}${note ? `, // ${note}` : ''}\n`
  }

  interfaceList.forEach((interfaceData) => {
    interfaceData.path = interfaceData.path.replace(/(:|{)(\w+)}*/g, '${$2}')
    let queryParams = '\n'
    interfaceData.req_query.forEach(item => {
      queryParams += getParamComment({
        ...item,
        type: 'string'
      })
    })

    let data = '\n'
    if (interfaceData.req_body_form?.length || (interfaceData.req_body_other && Object.keys(interfaceData.req_body_other).length)) {
      if (interfaceData.req_body_type === 'form') {
        interfaceData.req_body_form.forEach(item => {
          data += getParamComment({
            ...item,
            type: item.type === 'text' ? 'string' : 'file'
          })
        })
      } else if (interfaceData.req_body_type === 'json' && interfaceData.req_body_is_json_schema === true) {
        if (interfaceData.req_body_other?.properties) {
          data += propertiesHandler(interfaceData.req_body_other.properties, interfaceData.req_body_other?.required || [])
        }
        function propertiesHandler(properties, required = [], _blank = '    ') {
          let code = ''
          Object.keys(properties).map(key => {
            let type = properties[key].type;
            if (config.showSubProperties && type === 'array' && properties[key].items?.properties) {
              type = `[{\n${propertiesHandler(properties[key].items.properties, properties[key].items?.required || [], _blank + '  ')}${_blank}}]`
            }
            if (config.showSubProperties && type === 'object' && properties[key]?.properties) {
              type = `[{\n${propertiesHandler(properties[key].properties, properties[key]?.required || [], _blank + '  ')}${_blank}}]`
            }
            const note = `${required.includes(key) == 1 ? '* ' : ''}${!properties[key].description || properties[key].description === key ? '' : `${properties[key].description.replace(/\r+|\n+/g, '; ')} `}`
            code += `${_blank}${key}: ${type}${note ? `, // ${note}` : ''}\n`
          })
          return code
        }
      }

    }

    if (queryParams === '\n') {
      queryParams = ''
    }
    if (data === '\n') {
      data = ''
    }

    code += `

/**
 * @title ${interfaceData.title}
 * @path ${interfaceData.path}`
    if (interfaceData.req_params.length) {
      interfaceData.req_params.forEach(item => {
        code += `
 * @param {String|Number} ${item.name} ${item.desc === item.name ? '' : item.desc}`
      })
    }
    if (queryParams) {
      code += `
 * @param {Object} params `
    }
    if (data) {
      code += `
 * @param {Object} data `
    }
    code += `
 * @param {Object} options `
    if (config.showInfo && queryParams) {
      code += `
 * @info params {${queryParams}  }`
    }
    if (config.showInfo && data) {
      code += `
 * @info data {${data}  }`
    }
    code += `
 */
exports.${config.methodName(interfaceData.native_path, config.categoryId)} = ${requsetFun(interfaceData)}
  `;
  });

  return code;
}

function requsetFun(interfaceData) {
  let { path: url, method, req_params, req_query, req_body_form, req_body_other, req_body_type } = interfaceData
  let code = `function(`
  if (req_params?.length) {
    code += `${req_params.map(i => i.name).join(', ')}, `
  }
  if (req_query?.length) {
    code += `params, `
  }
  if (req_body_form?.length || (req_body_other && Object.keys(req_body_other).length)) {
    code += `data, `
  }
  code += `options = {}) {
return request({
  url: \`${url}\`,
  method: '${method}'`
  if (req_query?.length) {
    code += `,
  params`
  }
  if (req_body_form?.length || (req_body_other && Object.keys(req_body_other).length)) {
    code += `,
  data`
  }
  if (req_body_type === 'json') {
    code += `,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }`
  }
  code += `,
  ...options
})
}`

  return code
}