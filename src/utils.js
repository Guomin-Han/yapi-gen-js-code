exports.getDataByFields = function getDataByFields (data, field) {
  if (!data || !field || !Array.isArray (field)) {
    return null;
  }

  var arr = {};

  field.forEach (f => {
    typeof data[f] !== 'undefined' && (arr[f] = data[f]);
  });

  return arr;
}
