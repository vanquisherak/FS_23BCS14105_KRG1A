function formatJoiErrors(error, labelMap = {}){
  if (!error || !error.details) return [];
  return error.details.map(d => ({ field: d.path.join('.'), message: d.message, label: labelMap[d.path[0]] || d.path.join('.') }));
}

module.exports = { formatJoiErrors };
