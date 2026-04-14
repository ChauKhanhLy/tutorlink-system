const tutorDAL = require('../dal/tutor.dal')

// matching chính
exports.getTutors = async (filters) => {
  return await tutorDAL.getTutors(filters)
}