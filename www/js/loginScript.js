const baseUri = 'http://localhost:3000/'
const userSlug = 'users/'
const loginSlug = 'login'

const loginUser = async (uri, fields) => {
  try {
    const loginOptions = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(fields)
    }
    const response = await fetch(uri, loginOptions)

    const user = await response.json()
    const token = response.headers.get('x-auth-token')
    console.log(user, token)

    return { error: null, value: user, token }
  } catch (error) {
    console.log('Error in loginUser', error.message)
    return { error: error.message, value: null }
  }
}

const email = document.querySelector('[name = "email"]')
const password = document.querySelector('[name = "password"]')
const loginForm = document.querySelector('#login-form')
const failureAlert = document.querySelector('#failure-alert')

loginForm.addEventListener('submit', async e => {
  try {
    e.preventDefault()
    const {
      error: loginUserError,
      value: loggedInUser,
      token
    } = await loginUser(baseUri.concat(userSlug, loginSlug), {
      email: email.value,
      password: password.value
    })
    if (loginUserError) {
      failureAlert.classList.remove('visually-hidden')
      return
    } else {
      failureAlert.classList.add('visually-hidden')
    }
    if (loggedInUser.success) {
      failureAlert.classList.add('visually-hidden')
      localStorage.setItem('x-auth-token', token)
      window.location.href = 'main.html'
    } else {
      failureAlert.innerHTML = loggedInUser.message
      failureAlert.classList.remove('visually-hidden')
    }
  } catch (error) {
    console.error('Error in user log in', error)
    alert('Error while logging')
  }
})

const register = async (req, res) => {
    try {
      // extract fields
      const { email, password } = req.body
  console.log("email value in register",email);
  console.log("password value in register",password);
      // validate the fields
      const { error, value } = validateCreateUser(email, password)
      if (error) {
        return res.status(400).send(error.details[0].message)
      }
  
      // hash the password
      const passwordHash = await bcrypt.hash(
        value.password,
        config.get('hashing.salt')
      )
  
      // create the user in db
      const { createUserError, user } = await userService.create(
        value.email,
        passwordHash
      )
  
      if (createUserError) {
        return res.status(500).send({ success: false, message: createUserError })
      }
  
      const response = {
        success: true,
        message: 'User created successfully',
        data: user
      }
  
      return res.send(JSON.stringify(response))
    } catch (error) {
      return res
        .status(500)
        .send({ success: false, message: 'Server Error. Try again later!' })
    }
  }
  
  module.exports = { login, register }