const tutorDAL = require('../dal/tutor.dal')

exports.findTutors = (subject) => {
  if (!subject) throw new Error("Subject is required")

  return tutorDAL.findBySubject(subject)
}