const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
let filteredMovies = []
const MOVIES_PER_PAGE = 12
let nowPage = 1
let mode = ""

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changeMode = document.querySelector('#change-mode')

function renderMovieCard(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image, id
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id
      }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
  mode = "card"
}

function renderMovieList(data) {
  let rawHTML = ''
  rawHTML += `
      <table class="table table-hover">
      <tbody>`
  data.forEach((item) => {
    rawHTML += `
    <tr class="movie justify-content-between">
      <td>${item.title}</td>
      <td align="right"><button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id
      }">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button></td>
    </tr>`
  })
  rawHTML += `</tbody></table>
    `
  dataPanel.innerHTML = rawHTML
  mode = "list"
}

function displayMode() {
  if (mode === "card") {
    renderMovieCard(getMoviesByPage(nowPage))
  }
  else if (mode === "list") {
    renderMovieList(getMoviesByPage(nowPage))
  }
}

function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  modalTitle.innerText = ''
  modalDate.innerText = 'Release date: '
  modalDescription.innerText = ''
  modalImage.innerHTML = ''

  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results

    // insert data into modal ui
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('?????????????????????????????????')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//change mode
changeMode.addEventListener('click', (event) => {
  if (event.target.matches('.card-mode')) {
    renderMovieCard(getMoviesByPage(nowPage))
  }
  else if (event.target.matches('.list-mode')) {
    renderMovieList(getMoviesByPage(nowPage))
  }
})

// listen to data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  }
  else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//saerch
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //??????????????????
  //?????????????????????
  const keyword = searchInput.value.trim().toLowerCase()
  //?????????????????????????????????

  // ?????????????????????????????????
  // if (!keyword.length) {
  //   return alert('?????????????????????')
  // }
  //????????????
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  //????????????
  if (filteredMovies.length === 0) {
    return alert(`?????????????????????${keyword}???????????????????????????`)
  }
  //???????????????
  renderPaginator(filteredMovies.length)
  //?????????????????????
  nowPage = 1
  displayMode()
})

paginator.addEventListener('click', (event) => {
  //????????????????????????<a>???????????????
  if (event.target.tagName !== 'A') return
  //?????? dataset ????????????????????????
  nowPage = Number(event.target.dataset.page)
  //?????????mode?????????movie list
  displayMode()
})

//???????????????????????????
function getMoviesByPage(page) {
  //????????????index
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //???????????????????????????
  return data.slice(startIndex, startIndex
    + MOVIES_PER_PAGE)
}

//???????????????
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// send request to index api
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieCard(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

