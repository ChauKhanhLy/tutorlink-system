const tutorDAL = require('../dal/tutor.dal')

exports.getTutors = async (subject) => {
  return await tutorDAL.getTutorsBySubject(subject)
}