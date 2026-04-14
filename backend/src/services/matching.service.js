const tutorDAL = require('../dal/tutor.dal')

exports.getMatching = async (learnerId) => {
  //  MVP: chỉ cần lấy tutor đã verified
  const tutors = await tutorDAL.getVerifiedTutors()

  return tutors
}

exports.getTutors = async (subject) => {
  return await tutorDAL.getTutorsBySubject(subject)
}