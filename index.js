const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_PER_PAGE = 24

const usersList = []
let filteredUsers = []

const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('.pagination')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

function renderUserList(data) {

  let rawHTML = ''
  data.forEach(function (item) {
    //need avatar & name , id 隨著item 改變
    rawHTML += `
    <div class=col-sm-2>
      <div class=md-1>
        <div class="card">
          <img src="${item.avatar}"class="card-img-top" alt="data-image">
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
            <button class="btn btn-primary btn-show-user " data-toggle="modal" data-target="#users-model" data-id="${item.id}" >Show More</button>
            <button class = "btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div> 
    `
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    // data-page 綁在按鈕上
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    paginator.innerHTML = rawHTML
  }

}

function getUsersByPage(page) {
  // users ? "usersList" : "filteredUsers"  兩種都需要分頁，何時要使用，取決於是否有搜尋
  const data = filteredUsers.length ? filteredUsers : usersList

  const startIndex = (page - 1) * USERS_PER_PAGE
  //將資料作用範圍改成data
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

function showUserModal(id) {
  const modalImage = document.querySelector('#card-modal-image')
  const modalTitle = document.querySelector('#card-modal-title')
  const modalGender = document.querySelector('#card-modal-gender')
  const modalAge = document.querySelector('#card-modal-age')
  const modalBirthday = document.querySelector('#card-modal-birthday')
  const modalRegion = document.querySelector('#card-modal-region')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data

    modalImage.innerHTML = `<img src="${data.avatar}" class="card-img-top" alt="item-image">`
    modalTitle.textContent = `${data.name}${data.surname}`
    modalGender.textContent = `Gender: ${data.gender}`
    modalAge.textContent = `Now I am ${data.age} years old`
    modalBirthday.textContent = `I was born on ${data.birthday}`
    modalRegion.textContent = `I came from ${data.region}`
  })

}

axios.get(INDEX_URL)
  .then(function (response) {
    usersList.push(...response.data.results)
    renderPaginator(usersList.length)
    renderUserList(getUsersByPage(1))
  })


function addToFavorite(id) {

  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = usersList.find(user => user.id === id)

  if (list.some(user => user.id === id)) {
    return alert('已加入最愛！')
  }

  list.push(user)

  localStorage.setItem('favoriteUsers', JSON.stringify(list))

}

dataPanel.addEventListener('click', function onPanelClick(event) {

  if (event.target.matches('.btn-show-user')) {
    showUserModal(Number(event.target.dataset.id))
  } else (event.target.matches('.btn-add-favorite'))
  addToFavorite(Number(event.target.dataset.id))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredUsers = usersList.filter((user) => user.name.toLowerCase().includes(keyword))

  if (filteredUsers.length === 0) {
    return alert('Cannot find user with keyword ' + keyword)
  }
  renderPaginator(filteredUsers.length)
  renderUserList(getUsersByPage(1))
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  // !== <a> </a>
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))
})