import * as tutorDAL from '../dal/tutor.dal.js'

export const getTutors = async (filters) => {
  return await tutorDAL.getTutors(filters)
}

/*const tutorDAL = require('../dal/tutor.dal')

// matching chính
exports.getTutors = async (filters) => {
  return await tutorDAL.getTutors(filters)
}*/
