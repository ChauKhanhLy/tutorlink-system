const BASE_URL = "http://localhost:3000/api";

export const fetchTutors = async () => {
  const res = await fetch(`${BASE_URL}/tutors`);
  return res.json();
};

export const fetchTutorById = async (id) => {
  const res = await fetch(`${BASE_URL}/tutors/${id}`);
  return res.json();
};

export const fetchSessions = async () => {
  const res = await fetch(`${BASE_URL}/sessions`);
  return res.json();
};

export const searchTutors = async (query, subject) => {
  const res = await fetch(
    `${BASE_URL}/search?q=${query}&subject=${subject}`
  );
  return res.json();
};