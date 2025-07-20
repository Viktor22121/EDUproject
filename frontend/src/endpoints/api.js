import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/api/'
const LOGIN_URL = `${BASE_URL}token/`
const REFRESH_URL = `${BASE_URL}token/refresh/`
const AUTH_URL = `${BASE_URL}authenticated/`
const REGISTER_URL = `${BASE_URL}register/`
const LOGOUT_URL = `${BASE_URL}logout/`
const TESTS_URL = `${BASE_URL}tests/` 

export const login = async (username, password) => {
    const response = await axios.post(LOGIN_URL,
        {username:username, password:password},
        { withCredentials: true }
    )
    return response.data.success
}

export const login_teacher_api = async (code) => {
    try {  
    const response = await axios.post(LOGIN_URL,
        {code:code},
        { withCredentials: true }
    )
    return { success: !!response.data.success, isTeacher: !!response.data.is_teacher }
    } catch (error) {
        if (error.response && error.response.status === 401){
            return {success: false, isTeacher: false}
        }
    }
}

export const refresh_token = async () => {
    try {
        await axios.post(REFRESH_URL,
            {},
            { withCredentials: true }
        )
        return true
    } catch (error) {
        return false
    }
}

const call_refresh = async (error, func) => {
    if (error.response && error.response.status === 401) {
        const tokenRefreshed = await refresh_token();
        if (tokenRefreshed){
            const retryResponse = await func();
            return retryResponse.data
        }
    }
    return false
}

export const getUserStatus = async () => {
  try {
    const res = await axios.post(
      AUTH_URL,
      {},
      { withCredentials: true }
    )
    const d = res.data;

    return {
      authenticated: !!d.authenticated,
      isTeacher: !!(d.isTeacher ?? d.is_teacher)
    }
  } catch (err) {
    return await call_refresh(err)
  }
}



export const register = async (username, email, password, firstName, lastName) => {
    const response = axios.post(REGISTER_URL,
        {username:username, email:email, password:password, first_name: firstName, last_name: lastName},
        {withCredentials: true }
    )
    return response.data
}

export const logout = async () => {
    try {
        await axios.post(LOGOUT_URL,
            {},
            { withCredentials: true }
        )
        return true
    } catch (error) {
        return false
    }

}

export const getProfile = async () => {
  const res = await axios.get(`${BASE_URL}profile/`,
     { withCredentials:true });
  return res.data;
};

// Тесты


export const getTests = async () => {
    try {
        const response = await axios.get(TESTS_URL,
            { withCredentials: true }
        )
        return response.data
    } catch (error) {
        return await call_refresh(error, () =>
        axios.get(TESTS_URL, { withCredentials: true }))
    }
}

export const getTestById = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}tests/${id}/`, { withCredentials: true });
    return res.data;
  } catch (err) {
    return await call_refresh(err, () =>
      axios.get(`${BASE_URL}tests/${id}/`, { withCredentials: true })
    )
  }
}

export const startAttempt = async (testId) => {
  try {
    const res = await axios.post(
      `${BASE_URL}tests/${testId}/start/`,
      {},
      { withCredentials: true }
    )
    return res.data
  } catch (err) {
    return await call_refresh(err, () =>
      axios.post(`${BASE_URL}tests/${testId}/start/`, {}, { withCredentials: true })
    )
  }
}

export const answerQuestion = async (attemptId, questionId, answerId) => {
  try {
    const res = await axios.post(
      `${BASE_URL}attempts/${attemptId}/answer/`,
      { question: questionId, selected: answerId },
      { withCredentials: true }
    )
    return res.data;
  } catch (err) {
    return await call_refresh(err, () =>
      axios.post(
        `${BASE_URL}attempts/${attemptId}/answer/`,
        { question: questionId, selected: answerId },
        { withCredentials: true }
      )
    )
  }
}

export const finishAttempt = async (attemptId) => {
  try {
    const res = await axios.post(
      `${BASE_URL}attempts/${attemptId}/finish/`,
      {},
      { withCredentials: true }
    )
    return res.data
  } catch (err) {
    return await call_refresh(err, () =>
      axios.post(
        `${BASE_URL}attempts/${attemptId}/finish/`,
        {},
        { withCredentials: true }
      )
    )
  }
}

export const getAttemptById = async (attemptId) => {
  try {
    const res = await axios.get(`${BASE_URL}attempts/${attemptId}/`, {
      withCredentials: true,
    })
    return res.data;
  } catch (err) {
    return await call_refresh(err, () =>
      axios.get(`${BASE_URL}attempts/${attemptId}/`, { withCredentials: true })
    )
  }
}

export const submitCode = async (attemptId, questionId, code) => {
  try {
    const res = await axios.post(
      `${BASE_URL}submissions/`,
      { attempt: attemptId, question: questionId, code },
      { withCredentials: true }
    )
    return res.data
  } catch (err) {
    return await call_refresh(err, () =>
      axios.post(
        `${BASE_URL}submissions/`,
        { attempt: attemptId, question: questionId, code },
        { withCredentials: true }
      )
    )
  }
}

export const getSubmission = async (submissionId) => {
  try {
    const res = await axios.get(
      `${BASE_URL}submissions/${submissionId}/`,
      { withCredentials: true }
    );
    return res.data
  } catch (err) {
    return await call_refresh(err, () =>
      axios.get(`${BASE_URL}submissions/${submissionId}/`, {
        withCredentials: true,
      })
    )
  }
}

export const getSolvedAttempts = async () => {
  try {
    const res = await axios.get(`${BASE_URL}attempts/solved/`, {
      withCredentials: true,
    })
    return res.data
  } catch (err) {
    return await call_refresh(err, () =>
      axios.get(`${BASE_URL}attempts/solved/`, { withCredentials: true })
    )
  }
}

export const filterAttempts = async (params) => {
  try {
    const res = await axios.post(
    `${BASE_URL}attempts/filter/`,
    params,
    { withCredentials: true }
  )
  return res.data;
  } catch (err) {
    return await call_refresh(err, () =>
      axios.post(`${BASE_URL}attempts/filter/`, params, { withCredentials: true })
    )
  }
}

export const createTest = async payload => {
  try {
    const res = await axios.post(
      `${BASE_URL}tests/`,
      payload,
      { withCredentials: true }
    )
    return res.data;
  } catch (err) {
    return await call_refresh(err, () =>
      axios.post(`${BASE_URL}tests/`, payload, { withCredentials: true })
    )
  }
}