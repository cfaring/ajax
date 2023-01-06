import {create,edit, getName, remove} from './ApiService.js'

class PostService{
    constructor(){
        this.postsList = window.document.querySelector('.card-deck');
        this.removePost = this.removePost.bind(this);
        this.openEdit = this.openEdit.bind(this);
        this.onEdit = this.onEdit.bind(this);
        // this.editModal = document.querySelector('#editModal');
        
    }
    addPost(name, title, body, id){
        this.postsList.append(this.createPost(name, title, body, id));
    }

    createPost(name, title, body, id){
        const post = document.createElement('div');
        post.innerHTML = `
        <div class="card">
            <div class="post d-inline-flex align-items-center">
              <div class="image "><img src="vsources/avatar.png" width="100" height="100" alt="Card image cap"></div>
              <div class="card-name align-content-center justify-content-center mr-auto p-2" id="username" ><p class="text-center">${name}</p></div>
              <button type="button" class="btn btn-light"><span class="material-symbols-outlined">
                favorite
                </span></button>
              <button type="button" class="btn btn-light" id="delete-button" ><span class="material-symbols-outlined">
                delete
                </span></button>
              <button type="button" class="btn btn-light" data-toggle="modal" id="edit-button" data-target="#editModal" data-whatever="@fat"><span class="material-symbols-outlined">
                edit_square
                </span></button>

            </div>
            <div class="card-body">
              <h5 class="card-title">${title}</h5>
              <p class="card-text">${body}</p>
              
            </div>
          </div>
        </div>`;
        // post.id = id;
        post.querySelector(".post").id = id;
        // console.log(post);
        const buttonEdit = post.querySelector('#edit-button');
        const buttonDelete = post.querySelector('#delete-button');
        buttonEdit.addEventListener('click', this.openEdit);
        buttonDelete.addEventListener('click', this.removePost);
        return post;
    }

    removePost(event){
        const post = event.target.parentElement.parentElement;
        console.log(post, 'card');
        const dataPost = event.target.parentElement.parentElement.parentElement;
        remove(post.id).then((res) => {
            if(res.status >= 200 && res.status <= 300){
                event.target.removeEventListener('click',this.removePost);
                dataPost.remove();
                
            }
        })
    }
    openEdit(e){
        console.log(e.target.parentElement.parentElement);
        const userid = e.target.parentElement.parentElement;

        
        const id = e.target.parentElement.parentElement.id;
        const elem = e.target.parentElement.parentElement.parentElement;
        const editBtn = document.querySelector('#editModal__button-submit');
        editBtn.addEventListener('click',() => this.onEdit(e, id, elem));
        
    }
    
    onEdit(e, id,elem){

        e.preventDefault();
        const formData = {};
        const form = document.forms[1];
        const userName = elem.querySelector('#username'),
                  title = elem.querySelector('.card-title'),
                  body = elem.querySelector('.card-text');
        Array.from(form.elements)
            .filter((item) => !!item.name)
            .forEach((elem) => {
                formData[elem.name] = elem.value;
            });
        formData['id'] = id;
        if (!this.validateForm(form, formData)) {
            return;
        }
        const userid = formData['userid'];
        console.log(formData);
        edit(formData, id).then((data) => {
            console.log(title);
            console.log(body);
            title.innerText = `${data.title}`;
            
            body.innerText = `${data.body}`;
        }).then(getName(userid).then((name) => userName.textContent = `${name}`));
        form.reset();
        // this.closeEdit();
    }
    validateForm(form, formData) {
        const errors = [];
        if (formData.userid > 10 || formData.userid < 0 || isNaN(+formData.userid)) {
            errors.push('Поле UserId не должно иметь значения больше 10 или меньше 0');
        }
        if (!formData.userid.length || !formData.title.length || !formData.body.length) {
            errors.push('Все поля должны быть заполнены!');
        }

        if (errors.length) {
               const errorEl = form.getElementsByClassName('error')[0];
               console.log('hello world');
               errorEl.innerHTML = errors.map((er) => `<div>${er}</div>`).join('');
               return false;
          }

        return true;
    }
}

class MainService{
    constructor(postService, modalService){
        this.modalService = modalService;
        this.postService = postService;
        this.addBtn = document.querySelector('#promo__button-create');
        this.addBtn.addEventListener('click', (e) => this._onOpenModal(e));
    }
    init(){
        console.log('');
    }
    _onOpenModal(){
        this.modalService.open();
    }
}

class ModalService{
    constructor(postService) {
        this.postService = postService;
        this.addModal = document.querySelector('#modal');
        this.editModal = document.querySelector('#editModal');
        
        document.querySelector('#editModal__button-close').addEventListener('click', this.editListener);
        this.listener = this.close.bind(this);
        document.querySelector('#modal__button-close').addEventListener('click', this.listener);

        this.submitBtn = document.querySelector('#modal__button-submit');
        this.submitBtn.addEventListener('click', this._onCreate.bind(this));

    }

    open(){
        this.addModal.classList.toggle('visually-hidden');
    }
    close(){
        this.addModal.classList.toggle('visually-hidden');
    }
    
    _onCreate(e) {
        e.preventDefault();

        const formData = {};
        const form = document.forms[0];
        Array.from(form.elements)
            .filter((item) => !!item.name)
            .forEach((elem) => {
                formData[elem.name] = elem.value;
            });
        if (!this.validateForm(form, formData)) {
            return;
        }
        getName(formData.userid).then((res) => {
            formData['userid'] = res;
            return formData;
        }).then((formData) => create(formData).then((data) => {
            console.log(data, 'data');
            this.postService.addPost(data.userid, data.title, data.body, data.id);
        }));
        form.reset();
        this.close();
    }
   
    validateForm(form, formData) {
        const errors = [];
        if (formData.userid > 10 || formData.userid < 0 || isNaN(+formData.userid)){
            errors.push('User ID must be between 0 and 10');
        }
        if (!formData.userid.length || !formData.title.length || !formData.body.length) {
            errors.push('Enter your values please');
        }

        if (errors.length) {
            const errorEl = form.getElementsByClassName('error2')[0];
            console.log(errorEl);
            errorEl.innerHTML = errors.map((er) => `<div class="text-danger">${er}</div>`).join('');

            return false;
        }

        return true;
    }
}

const postService = new PostService();
const modalService = new ModalService(postService);
const service = new MainService(postService, modalService);
service.init();