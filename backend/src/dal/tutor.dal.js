const tutors = [
  { id: 1, name: "A", subjects: ["Math", "English"] },
  { id: 2, name: "B", subjects: ["Physics"] },
  { id: 3, name: "C", subjects: ["Math"] }
]

exports.findBySubject = (subject) => {
  return tutors.filter(t => t.subjects.includes(subject))
}