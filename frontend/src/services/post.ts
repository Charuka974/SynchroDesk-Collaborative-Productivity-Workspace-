import api from "./api"

export const getAllPost = async (page: number, limit: number) => {
  const res = await api.get(`/post?page=${page}&limit=${limit}`)
  return res.data
}
